import { Injectable } from '@nestjs/common';
import path from 'path';
import { GenerateDocumentInput } from './template-generator.model';
import { ProcessService } from '@auto-document/nest/process.service';

@Injectable()
export class TemplateGeneratorService {
  constructor(private readonly processService: ProcessService) {}
  async generate(input: GenerateDocumentInput): Promise<File> {
    const pythonPath = path.join(__dirname, 'generate.py');
    const inputBuffer = new TextEncoder().encode(JSON.stringify(input.data)).buffer;
    const templateBuffer = await input.templateFile.arrayBuffer();
    try {
      const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer, inputBuffer]);
      const blob = new Blob([new Uint8Array(buffer as ArrayBuffer)], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const file = new File([blob], input.documentFileName, {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      return file;
    } catch (error) {
      console.error(input);
      throw error;
    }
  }
}
