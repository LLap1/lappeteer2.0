import { Controller, Logger } from '@nestjs/common';
import path from 'path';
import { $ } from 'bun';
import { unlink } from 'fs/promises';

import {
  type AnalyzeRequest,
  type AnalyzeResponse,
  type AnalyzeTemplateParams,
  type AnalyzedTemplate,
  type GenerateRequest,
  type GenerateResponse,
  type GenerateDocumentParams,
  type GeneratedDocument,
  DocumentProcessorServiceControllerMethods,
  type DocumentProcessorServiceController,
} from '@auto-document/types/proto/document-processor';
import { Log } from '@auto-document/utils/log';
import { from, concatMap, Observable, map, toArray } from 'rxjs';

@Controller()
@DocumentProcessorServiceControllerMethods()
export class DocumentProcessorService implements DocumentProcessorServiceController {
  private static readonly logger = new Logger(DocumentProcessorService.name);

  @Log(DocumentProcessorService.logger)
  generate(request: Observable<GenerateRequest>): Observable<GenerateResponse> {
    return request.pipe(
      concatMap(req =>
        from(req.params).pipe(
          concatMap(params => this.generateDocument(params)),
          toArray(),
          map(documents => ({ documents })),
        ),
      ),
    );
  }

  @Log(DocumentProcessorService.logger)
  analyze(request: Observable<AnalyzeRequest>): Observable<AnalyzeResponse> {
    return request.pipe(
      concatMap(req =>
        from(req.params).pipe(
          concatMap(params => this.analyzeTemplate(params)),
          toArray(),
          map(templates => ({ templates })),
        ),
      ),
    );
  }

  private async analyzeTemplate(params: AnalyzeTemplateParams): Promise<AnalyzedTemplate> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'parse.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${Date.now()}.pptx`);

    try {
      await Bun.write(inputFilePath, params.file);

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

  private async generateDocument(params: GenerateDocumentParams): Promise<GeneratedDocument> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'generate.py');
    const tempDir = '/tmp';
    const inputFilePath = path.join(tempDir, `${Date.now()}.pptx`);

    try {
      await Bun.write(inputFilePath, params.file);

      const dataString = JSON.stringify(params.data);
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
}
