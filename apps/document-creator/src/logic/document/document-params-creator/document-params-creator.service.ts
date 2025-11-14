import { Injectable, Param } from '@nestjs/common';
import { DocumentTemplatePlaceholder } from 'src/logic/template/template-parser/template-parser.model';
import {
  CreateDocumentData,
  CreateDocumentDataTypes,
  CreateDocumentInput,
} from 'src/orpc/routers/documents/documents.router.schema';
import { CreateDocumentDataParam } from './document-params-creator.model';
import { MapCreatorService } from '../../map-creator/map-creator.service';

@Injectable()
export class DocumentParamsCreatorService {
  constructor(private readonly mapCreatorService: MapCreatorService) {}

  async create(params: CreateDocumentData[], placeholders: DocumentTemplatePlaceholder[]) {
    const populatedParams = this.populateParamsWithPlaceholders(params, placeholders);
    const mapParams = populatedParams
      .filter(p => p.type === 'map')
      .map(p => {
        return {
          id: p.key,
          ...p.value,
        };
      });

    const stringParams = populatedParams.filter(p => p.type === 'string');
    const maps = await this.mapCreatorService.create(mapParams);
    const populatedParamsWithMaps = populatedParams
      .filter(p => p.type === 'map')
      .map(p => {
        return {
          ...p,
          value: maps.find(m => m.id === p.key)!.base64,
        };
      });
    return [...populatedParamsWithMaps, ...stringParams];
  }

  private populateParamsWithPlaceholders(params: CreateDocumentData[], placeholders: DocumentTemplatePlaceholder[]) {
    return params.map(param => {
      const placeholder = placeholders.find(p => p.key === param.key);
      switch (param.type) {
        case 'map':
          return {
            ...param,
            value: {
              ...param.value,
              width: placeholder!.width,
              height: placeholder!.height,
            },
          };
        case 'string':
          return param;
      }
    });
  }
}
