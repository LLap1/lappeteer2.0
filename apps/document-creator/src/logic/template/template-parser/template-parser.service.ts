import { Injectable } from '@nestjs/common';
import { DocumentTemplatePlaceholder } from './template-parser.model';
import path from 'path';
import { ProcessService } from '../../process/process.service';

@Injectable()
export class TemplateParserService {
  constructor(private readonly processService: ProcessService) {}

  async extractParams(templateFile: File): Promise<DocumentTemplatePlaceholder[]> {
    const pythonPath = path.join(__dirname, 'extract_params.py');
    const templateBuffer = await templateFile.arrayBuffer();

    const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer]);

    const result = JSON.parse(new TextDecoder().decode(buffer)) as DocumentTemplatePlaceholder[];
    return result;
  }
}
