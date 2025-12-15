import { Controller, Logger } from '@nestjs/common';
import path from 'path';
import { $ } from 'bun';
import { unlink } from 'fs/promises';

import {
  type AnalyzeTemplateRequest,
  type AnalyzeTemplateResponse,
  type GenerateDocumentRequest,
  type GenerateDocumentResponse,
  DocumentProcessorServiceControllerMethods,
  type DocumentProcessorServiceController,
} from '@auto-document/types/proto/document-processor';
import { Log } from '@auto-document/utils/log';

@Controller()
@DocumentProcessorServiceControllerMethods()
export class DocumentProcessorService implements DocumentProcessorServiceController {
  private static readonly logger = new Logger(DocumentProcessorService.name);

  @Log(DocumentProcessorService.logger)
  async generate(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'generate.py');
    const tempDir = '/tmp';

    const inputFilePath = path.join(tempDir, `${Date.now()}-${request.filename}`);

    try {
      await Bun.write(inputFilePath, request.file);

      const dataString = JSON.stringify(request.data);
      const outputFilepath = await $`python ${pythonPath} ${inputFilePath} ${dataString}`.text();
      const outputPath = outputFilepath.trim();

      const outputFile = Bun.file(outputPath);
      const fileBytes = await outputFile.arrayBuffer();
      const fileUint8Array = new Uint8Array(fileBytes);

      await unlink(inputFilePath).catch(() => {});
      await unlink(outputPath).catch(() => {});

      return { file: fileUint8Array };
    } catch (error) {
      await unlink(inputFilePath).catch(() => {});
      console.error(error);
      throw error;
    }
  }

  async analyze(request: AnalyzeTemplateRequest): Promise<AnalyzeTemplateResponse> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'parse.py');
    const tempDir = '/tmp';

    const inputFilePath = path.join(tempDir, `${Date.now()}.pptx`);

    try {
      await Bun.write(inputFilePath, request.file);

      const output = await $`python ${pythonPath} ${inputFilePath}`.text();
      const result = JSON.parse(output);

      await unlink(inputFilePath).catch(() => {});

      return { placeholders: result };
    } catch (error) {
      console.error(error);
      await unlink(inputFilePath).catch(() => {});
      throw error;
    }
  }
}
