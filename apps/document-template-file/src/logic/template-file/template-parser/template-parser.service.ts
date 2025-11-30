import { Injectable } from '@nestjs/common';
import { DocumentTemplatePlaceholder } from './template-parser.model';
import path from 'path';
import { ProcessService } from '@auto-document/nest/process.service';

@Injectable()
export class TemplateParserService {
  constructor(private readonly processService: ProcessService) {}

  async extractParams(templateFile: File): Promise<DocumentTemplatePlaceholder[]> {
    const pythonPath = path.join(__dirname, 'parse.py');
    const templateBuffer = await templateFile.arrayBuffer();

    const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer]);

    const result = JSON.parse(new TextDecoder().decode(buffer)) as DocumentTemplatePlaceholder[];
    return result;
  }
}
