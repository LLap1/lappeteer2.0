import { Injectable } from '@nestjs/common';
import { uuidv4 } from 'node_modules/zod/v4/classic/index.cjs';
import { DocumentTemplatePlaceholder } from 'src/logic/template/template-parser/template-parser.model';
import { CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';

@Injectable()
export class DocumentParamsCreatorService {
  async create(
    input: CreateDocumentsInput,
    placeholders: DocumentTemplatePlaceholder[],
  ): Promise<CreateDocumentsInput> {
    const newInputsData = input.data.map(data => {
      return {
        ...data,
        map: data.map.map(mapData => {
          const placeholder = placeholders.find(p => p.key === mapData.key);
          return {
            ...mapData,
            creationData: {
              ...mapData.creationData,
              width: placeholder!.width,
              height: placeholder!.height,
            },
          };
        }),
      };
    });

    return {
      ...input,
      data: newInputsData,
    };
  }
}
