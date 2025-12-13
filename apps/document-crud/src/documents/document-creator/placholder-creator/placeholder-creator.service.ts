import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PlaceholderParams } from './placeholder-creator.model';
import { v4 as uuidv4 } from 'uuid';
import type { Placeholder } from '@auto-document/types/document';
import { firstValueFrom } from 'rxjs';
import { type DocumentMapCreatorServiceClient } from '@auto-document/types/proto/document-map-creator';
import { Log } from '@auto-document/utils/logger';
@Injectable()
export class PlaceholderCreatorService {
  private static readonly logger = new Logger(PlaceholderCreatorService.name);
  constructor(
    @Inject('DocumentMapCreatorServiceClient')
    private readonly documentMapCreatorService: DocumentMapCreatorServiceClient,
  ) {}

  @Log(PlaceholderCreatorService.logger)
  async create(params: PlaceholderParams[]): Promise<Placeholder[]> {
    const mapPlaceholderParmas = params.filter(p => p.type === 'map') as PlaceholderParams<'map'>[];
    const textPlaceholderParmas = params.filter(p => p.type === 'text') as PlaceholderParams<'text'>[];
    const imagePlaceholderParmas = params.filter(p => p.type === 'image') as PlaceholderParams<'image'>[];

    const placeholders = await Promise.all([
      ...(await this.createMapPlaceholder(mapPlaceholderParmas)),
      ...(await this.createTextPlaceholder(textPlaceholderParmas)),
      ...(await this.createImagePlaceholder(imagePlaceholderParmas)),
    ]);

    return placeholders;
  }

  private async createMapPlaceholder(params: PlaceholderParams<'map'>[]): Promise<Placeholder<'map'>[]> {
    if (params.length === 0) {
      return [];
    }

    const createMapsParams = params.map(p => ({
      id: p.id,
      width: p.width,
      height: p.height,
      center: p.params.center,
      zoom: p.params.zoom,
      geojson: p.params.geojson,
    }));

    const maps = (await firstValueFrom(this.documentMapCreatorService.create({ maps: createMapsParams }))).maps;
    const mapPlaceholders = params.map(p => {
      const map = maps.find(m => m.id === p.id);
      if (!map) {
        throw new Error(`Map not found for placeholder ${p.id}`);
      }
      return {
        ...p,
        value: map.layerDataUrls,
      };
    });

    return mapPlaceholders;
  }

  private async createTextPlaceholder(params: PlaceholderParams<'text'>[]): Promise<Placeholder<'text'>[]> {
    const textPlaceholders: Placeholder<'text'>[] = params.map(p => ({
      ...p,
      value: p.params,
    }));

    return textPlaceholders;
  }
  private async createImagePlaceholder(params: PlaceholderParams<'image'>[]): Promise<Placeholder<'image'>[]> {
    const imagePlaceholders: Placeholder<'image'>[] = params.map(p => ({
      ...p,
      value: p.params,
    }));

    return imagePlaceholders;
  }
}
