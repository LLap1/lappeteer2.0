import { Injectable } from '@nestjs/common';
import type {
  GenerateTemplateInput,
  GenerateTemplateOutput,
} from 'src/logic/document-generator/document-generator.router.schema';
import { ProcessService } from '@auto-document/nest/process.service';
import path from 'path';

@Injectable()
export class DocumentGeneratorService {
  constructor(private readonly processService: ProcessService) {}

  async generateDocument(input: GenerateTemplateInput): Promise<GenerateTemplateOutput> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'generate.py');
    const inputBuffer = new TextEncoder().encode(JSON.stringify(input.data)).buffer;
    const templateBuffer = await input.file.arrayBuffer();
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
