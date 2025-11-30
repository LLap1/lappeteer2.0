import { Injectable } from '@nestjs/common';
import type { ExtractTemplateParamsOutput } from 'src/logic/template-analyzer/template-analyzer.router.schema';
import { ProcessService } from '@auto-document/nest/process.service';
import path from 'path';

@Injectable()
export class TemplateAnalyzerService {
  constructor(private readonly processService: ProcessService) {}

  async extractParams(templateFile: File): Promise<ExtractTemplateParamsOutput> {
    const pythonPath = path.join(__dirname, 'python-scripts', 'parse.py');
    const templateBuffer = await templateFile.arrayBuffer();

    const buffer = await this.processService.run(['python3', pythonPath], [templateBuffer]);

    const result = JSON.parse(new TextDecoder().decode(buffer)) as ExtractTemplateParamsOutput;
    return result;
  }
}
