import { Injectable } from '@nestjs/common';
import { DocumentTemplatePlaceholder } from './template-parser.model';
import path from 'path';
import { spawn } from 'bun';

@Injectable()
export class TemplateParserService {
  async extractParams(templateFile: File): Promise<DocumentTemplatePlaceholder[]> {
    const pythonPath = path.join(__dirname, 'extract_params.py');
    const templateBuffer = await templateFile.arrayBuffer();
    const proc = spawn(['python3', pythonPath], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const templateSize = new DataView(new ArrayBuffer(8));
    templateSize.setBigUint64(0, BigInt(templateBuffer.byteLength), false);
    proc.stdin.write(new Uint8Array(templateSize.buffer));
    proc.stdin.write(new Uint8Array(templateBuffer));
    proc.stdin.end();

    const buffer = await new Response(proc.stdout).arrayBuffer();
    const stderr = await new Response(proc.stderr).text();

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.error('Python script stderr:', stderr);
      throw new Error(`Python script failed with exit code ${exitCode}`);
    }

    console.log('Python script stderr:', stderr);

    const result = JSON.parse(new TextDecoder().decode(buffer)) as DocumentTemplatePlaceholder[];
    return result;
  }
}
