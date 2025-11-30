import { Injectable } from '@nestjs/common';
import { TemplateGeneratorService } from './template-generator/template-generator.service';
import { TemplateParserService } from './template-parser/template-parser.service';
import type {
  GenerateTemplateInput,
  GenerateTemplateOutput,
  ExtractTemplateParamsOutput,
} from 'src/logic/template-file/template-file.router.schema';

@Injectable()
export class TemplateFileService {
  constructor(
    private readonly templateGenerator: TemplateGeneratorService,
    private readonly templateParser: TemplateParserService,
  ) {}

  async generateDocument(input: GenerateTemplateInput): Promise<GenerateTemplateOutput> {
    return await this.templateGenerator.generate({
      templateFile: input.file,
      documentFileName: input.documentFileName,
      data: input.data,
    });
  }

  async extractParams(templateFile: File): Promise<ExtractTemplateParamsOutput> {
    return await this.templateParser.extractParams(templateFile);
  }
}
