import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { of, map, firstValueFrom, switchMap } from 'rxjs';
import type { CreateDocumentsInput } from '../../documents.router.schema';
import type { TemplatePlaceholder } from '@auto-document/types/document';
import { ORPC_CLIENT } from '@auto-document/nest/orpc-client.module';
import { Span } from 'nestjs-otel';
import type { Client } from '../../../orpc';

@Injectable()
export class DocumentParamsTransformerService {
  private transformPipline = (params: CreateDocumentsInput, placeholders: TemplatePlaceholder[]) =>
    of(params).pipe(
      map(params => this.populateParamsWithIds(params)),
      map(params => this.populateParamsWithPlaceholders(params, placeholders)),
      map(params => this.populateParamsWithMapData(params)),
    );

  constructor(
    @Inject(ORPC_CLIENT)
    private readonly orpcClient: Client,
  ) {}

  @Span()
  async transform(params: CreateDocumentsInput, placeholders: TemplatePlaceholder[]) {
    const transformedParams = await firstValueFrom(this.transformPipline(params, placeholders));
    return transformedParams;
  }

  populateParamsWithPlaceholders(params: CreateDocumentsInput, placeholders: TemplatePlaceholder[]) {
    return {
      ...params,
      data: params.data.map(data => ({
        ...data,
        placeholderData: data.placeholderData.map(placeholderData => {
          const matchingPlaceholder = placeholders.find(placeholder => placeholder.key === placeholderData.key);
          if (!matchingPlaceholder) {
            throw new Error(`Placeholder ${placeholderData.key} not found in template`);
          }
          return {
            ...placeholderData,
            width: matchingPlaceholder.width,
            height: matchingPlaceholder.height,
          };
        }),
      })),
    };
  }

  private populateParamsWithIds(params: CreateDocumentsInput) {
    return {
      ...params,
      data: params.data.map(data => ({
        ...data,
        placeholderData: data.placeholderData.map(placeholder => ({
          ...placeholder,
          id: uuidv4(),
        })),
      })),
    };
  }

  private async populateParamsWithMapData(params: CreateDocumentsInput) {
    const mapParams = params.data
      .map(data =>
        data.placeholderData
          .filter(placeholder => placeholder.type === 'map')
          .map(placeholder => {
            return {
              // @ts-ignore
              id: placeholder.id,
              // @ts-ignore
              width: placeholder.width,
              // @ts-ignore
              height: placeholder.height,
              center: placeholder.value.center,
              zoom: placeholder.value.zoom,
              geojson: placeholder.value.geojson,
            };
          }),
      )
      .flat();
    const mapData = await this.orpcClient.documentMapCreator.create(mapParams);
    const populatedParams = {
      ...params,
      data: params.data.map(data => ({
        ...data,
        placeholderData: data.placeholderData.map(placeholderData => {
          switch (placeholderData.type) {
            case 'map':
              return {
                ...placeholderData,
                // @ts-ignore
                value: mapData.find(map => map.id === placeholderData.id)!.layerDataUrls,
              };
            default:
              return placeholderData;
          }
        }),
      })),
    };
    return populatedParams;
  }
}
