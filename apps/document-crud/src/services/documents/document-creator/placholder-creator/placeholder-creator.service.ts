import { Injectable } from '@nestjs/common';
import type { PlaceholderParams } from '@auto-document/domain/document-crud.schema';
import type { Placeholder, PlaceholderType } from '@auto-document/types/document';
import { DocumentMapCreatorService } from './document-map-creator/document-map-creator.service';
import type { CreateMapsInput } from './document-map-creator/document-map-creator.model';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlaceholderCreatorService {
  constructor(private readonly documentMapCreatorService: DocumentMapCreatorService) {}

  async create(params: PlaceholderParams[]): Promise<Placeholder<PlaceholderType>[]> {
    const mapParams = params.filter((p): p is PlaceholderParams<'map'> => p.type === 'map');
    const textParams = params.filter((p): p is PlaceholderParams<'text'> => p.type === 'text');
    const imageParams = params.filter((p): p is PlaceholderParams<'image'> => p.type === 'image');

    const maps = await this.createMapPlaceholders(mapParams);
    const texts = await this.createTextPlaceholders(textParams);
    const images = await this.createImagePlaceholders(imageParams);

    return [...maps, ...texts, ...images];
  }

  private async createMapPlaceholders(params: PlaceholderParams<'map'>[]): Promise<Placeholder<'map'>[]> {
    if (params.length === 0) {
      return [];
    }

    const createMapsParams: CreateMapsInput = params.map(p => ({
      id: p.id,
      width: p.width,
      height: p.height,
      geojson: p.params.geojson,
      overlayId: p.params.overlayId,
      rotation: p.params.rotation,
    }));

    const maps = await this.documentMapCreatorService.create(createMapsParams);

    return params.map(param => {
      const mapResult = maps.find(map => map.id === param.id);
      if (!mapResult) {
        throw new Error(`Map not found for placeholder ${param.id}`);
      }
      return { ...param, value: mapResult.layers };
    });
  }

  private async createTextPlaceholders(params: PlaceholderParams<'text'>[]): Promise<Placeholder<'text'>[]> {
    return params.map(p => ({ ...p, value: p.params }));
  }

  private async createImagePlaceholders(params: PlaceholderParams<'image'>[]): Promise<Placeholder<'image'>[]> {
    return Promise.all(
      params.map(async p => {
        const filePath = await this.downloadImage(p.params.url);
        return {
          ...p,
          value: {
            url: filePath,
            rotation: p.params.rotation,
          },
        };
      }),
    );
  }

  private async downloadImage(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' : '.png';

    const arrayBuffer = await response.arrayBuffer();
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, `image-${uuidv4()}${extension}`);

    await Bun.write(filePath, arrayBuffer);

    return filePath;
  }
}
