import { Injectable } from '@nestjs/common';
import type { GenerateDocumentInput, GenerateDocumentOuput } from './document-processor.router.schema';
import type { AnalyzeTemplateParamsInput, AnalyzeTemplateParamsOutput } from './document-processor.router.schema';
import path from 'path';
import { ProcessService } from '@auto-document/nest/process.service';
import { PPTX_MIME_TYPE } from '@auto-document/types/file';
import { Span } from 'nestjs-otel';

@Injectable()
export class DocumentProcessorService {
  constructor(private readonly processService: ProcessService) {}

  @Span()
  async generate(input: GenerateDocumentInput): Promise<GenerateDocumentOuput> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'generate.py');
    const inputBuffer = new TextEncoder().encode(JSON.stringify(input.data)).buffer;
    const templateBuffer = await input.file.arrayBuffer();
    try {
      const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer, inputBuffer]);
      const blob = new Blob([new Uint8Array(buffer as ArrayBuffer)], {
        type: PPTX_MIME_TYPE,
      });
      const file = new File([blob], input.documentFileName, {
        type: PPTX_MIME_TYPE,
      });
      return file;
    } catch (error) {
      console.error(input);
      throw error;
    }
  }
  async analyze(input: AnalyzeTemplateParamsInput): Promise<AnalyzeTemplateParamsOutput> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'parse.py');
    const templateBuffer = await input.file.arrayBuffer();

    const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer]);

    const result = JSON.parse(new TextDecoder().decode(buffer)) as AnalyzeTemplateParamsOutput;
    return result;
  }
}
