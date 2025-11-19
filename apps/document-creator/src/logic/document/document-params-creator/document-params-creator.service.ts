import { Injectable, Param } from '@nestjs/common';
import { DocumentTemplatePlaceholder } from 'src/logic/template/template-parser/template-parser.model';
import { CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';
import { MapCreatorService } from '../../map-creator/map-creator.service';
import { v4 as uuidv4 } from 'uuid';
import { of, map, firstValueFrom } from 'rxjs';
import { GenerateDocumentInput } from '../document-generator/document-generator.model';
import { CreateMapParams } from 'src/logic/map-creator/map-creator.model';

@Injectable()
export class DocumentParamsTransformerService {
  private transformPipline = (params, placeholders: DocumentTemplatePlaceholder[]) =>
    of(params).pipe(
      map(params => this.populateParamsWithIds(params)),
      map(params => this.populateParamsWithPlaceholders(params, placeholders)),
      map(params => this.populateParamsWithMapData(params)),
    );

  constructor(private readonly mapCreatorService: MapCreatorService) {}

  async transform(params: CreateDocumentsInput, placeholders: DocumentTemplatePlaceholder[]) {
    const transformedParams = await firstValueFrom(this.transformPipline(params, placeholders));
    return transformedParams;
  }

  populateParamsWithPlaceholders(params: CreateDocumentsInput, placeholders: DocumentTemplatePlaceholder[]) {
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
          .map(placeholder => ({
            id: placeholder.id,
            width: placeholder.width,
            height: placeholder.height,
            center: placeholder.value.center,
            zoom: placeholder.value.zoom,
            geojson: placeholder.value.geojson,
          })),
      )
      .flat();
    const mapData = await this.mapCreatorService.create(mapParams as CreateMapParams[]);
    const populatedParams = {
      ...params,
      data: params.data.map(data => ({
        ...data,
        placeholderData: data.placeholderData.map(placeholderData => {
          switch (placeholderData.type) {
            case 'map':
              return {
                ...placeholderData,
                value: mapData.find(map => map.id === placeholderData.id)!.base64,
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
