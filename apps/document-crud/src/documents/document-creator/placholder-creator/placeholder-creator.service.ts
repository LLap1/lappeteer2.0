import { Inject, Injectable } from '@nestjs/common';
import type { PlaceholderParams } from './placeholder-creator.model';
import type { Placeholder, PlaceholderType } from '@auto-document/types/document';
import { forkJoin, map, Observable, of } from 'rxjs';
import {
  DOCUMENT_MAP_CREATOR_SERVICE_NAME,
  type DocumentMapCreatorServiceClient,
} from '@auto-document/types/proto/document-map-creator';

@Injectable()
export class PlaceholderCreatorService {
  constructor(
    @Inject(DOCUMENT_MAP_CREATOR_SERVICE_NAME)
    private readonly documentMapCreatorService: DocumentMapCreatorServiceClient,
  ) {}

  create(params: PlaceholderParams[]): Observable<Placeholder<PlaceholderType>[]> {
    const mapParams = params.filter((p): p is PlaceholderParams<'map'> => p.type === 'map');
    const textParams = params.filter((p): p is PlaceholderParams<'text'> => p.type === 'text');
    const imageParams = params.filter((p): p is PlaceholderParams<'image'> => p.type === 'image');

    return forkJoin({
      maps: this.createMapPlaceholders(mapParams),
      texts: this.createTextPlaceholders(textParams),
      images: this.createImagePlaceholders(imageParams),
    }).pipe(map(({ maps, texts, images }) => [...maps, ...texts, ...images]));
  }

  private createMapPlaceholders(params: PlaceholderParams<'map'>[]): Observable<Placeholder<'map'>[]> {
    if (params.length === 0) {
      return of([]);
    }

    const createMapsParams = params.map(p => ({
      id: p.id,
      width: p.width,
      height: p.height,
      center: p.params.center,
      zoom: p.params.zoom,
      geojson: p.params.geojson,
    }));

    return this.documentMapCreatorService.create({ maps: createMapsParams }).pipe(
      map(response =>
        params.map(param => {
          const mapResult = response.maps.find(m => m.id === param.id);
          if (!mapResult) {
            throw new Error(`Map not found for placeholder ${param.id}`);
          }
          return { ...param, value: mapResult.layerDataUrls };
        }),
      ),
    );
  }

  private createTextPlaceholders(params: PlaceholderParams<'text'>[]): Observable<Placeholder<'text'>[]> {
    return of(params.map(p => ({ ...p, value: p.params })));
  }

  private createImagePlaceholders(params: PlaceholderParams<'image'>[]): Observable<Placeholder<'image'>[]> {
    return of(params.map(p => ({ ...p, value: p.params })));
  }
}
