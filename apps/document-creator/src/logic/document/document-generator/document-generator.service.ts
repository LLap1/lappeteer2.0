import { Injectable } from '@nestjs/common';
import { spawn } from 'bun';
import path from 'path';
import { GenerateDocumentInput, GenerateDocumentOutput } from './document-generator.model';
import { ProcessService } from '../../process/process.service';

@Injectable()
export class DocumentGeneratorService {
  constructor(private readonly processService: ProcessService) {}
  async generate(input: GenerateDocumentInput): Promise<File> {
    const pythonPath = path.join(__dirname, 'generate.py');
    const inputBuffer = new TextEncoder().encode(JSON.stringify(input.data)).buffer;
    const templateBuffer = await input.templateFile.arrayBuffer();
    const buffer = await this.processService.runProcess(['python3', pythonPath], [templateBuffer, inputBuffer]);
    const blob = new Blob([new Uint8Array(buffer as ArrayBuffer)], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const file = new File([blob], input.documentFileName, {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    return file;
  }
}
