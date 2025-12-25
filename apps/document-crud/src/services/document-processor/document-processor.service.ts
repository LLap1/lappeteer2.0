import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { $ } from 'bun';
import { unlink } from 'fs/promises';

import {
  type AnalyzeRequest,
  type AnalyzeResponse,
  type GenerateRequest,
  type GenerateResponse,
} from './document-processor.model';
import { Log } from '@auto-document/utils/log';

@Injectable()
export class DocumentProcessorService {
  private static readonly logger = new Logger(DocumentProcessorService.name);

  @Log(DocumentProcessorService.logger)
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'generate.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${Date.now()}.pptx`);

    await Bun.write(inputFilePath, request.templateFile);

    const dataString = JSON.stringify(request.data);
    const slidesToRemoveString = request.slidesToRemove ? JSON.stringify(request.slidesToRemove) : '[]';
    const outputFilepath = await $`python ${pythonPath} ${inputFilePath} ${dataString} ${slidesToRemoveString}`.text();
    const outputPath = outputFilepath.trim();

    const outputFile = Bun.file(outputPath);
    const fileBytes = await outputFile.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBytes);

    await unlink(inputFilePath).catch(() => {});
    return new File([fileUint8Array], request.outputFilename);
  }

  @Log(DocumentProcessorService.logger)
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'parse.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${Date.now()}.pptx`);

    try {
      await Bun.write(inputFilePath, request);

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
