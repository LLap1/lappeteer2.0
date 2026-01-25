import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class DocumentProcessorService {
  private static readonly logger = new Logger(DocumentProcessorService.name);
  constructor(@Inject('SCRIPTS_PATH') private readonly scriptsPath: string) {}
  @Log(DocumentProcessorService.logger)
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const pythonPath = path.join(this.scriptsPath, 'generate.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${uuidv4()}.pptx`);
    const outputFilePath = path.join(tempDir, request.outputFilename);
    await Bun.write(inputFilePath, await request.templateFile.arrayBuffer());

    const dataString = JSON.stringify(request.data);
    const slidesToRemoveString = JSON.stringify(request.slidesToRemove) ?? '[]';
    console.log('before');
    await $`python ${pythonPath} ${inputFilePath} ${dataString} ${outputFilePath} ${slidesToRemoveString}`.text();
    console.log('after');

    await unlink(inputFilePath).catch(() => {});
    return Bun.file(outputFilePath);
  }

  @Log(DocumentProcessorService.logger)
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const pythonPath = path.join(this.scriptsPath, 'parse.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${uuidv4()}.pptx`);

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
