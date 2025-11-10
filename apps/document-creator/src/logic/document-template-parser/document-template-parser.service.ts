import { Injectable } from '@nestjs/common';
import { ParseDocumentTemplateInput, ParseDocumentTemplateOutput } from './document-template-parser.model';
import path from 'path';
import { spawn } from 'bun';
import { CreateDocumentsDataOutput } from '../document-data-creator/document-data-creator.model';

@Injectable()
export class DocumentTemplateParserService {
  async extractParams(templateFile: File): Promise<string[]> {
    const pythonPath = path.join(__dirname, 'python-pptx-handler', 'extract_params.py');
    const templateBuffer = await templateFile.arrayBuffer();
    const proc = spawn(['python3', pythonPath, '--stdin'], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const templateSize = new DataView(new ArrayBuffer(8));
    templateSize.setBigUint64(0, BigInt(templateBuffer.byteLength), false); // false = big-endian
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

    return JSON.parse(new TextDecoder().decode(buffer)) as string[];
  }

  async parse(input: ParseDocumentTemplateInput): Promise<ParseDocumentTemplateOutput> {
    return this.replace(input.templateFile, input.data.map.map, input.data.strings, input.data.filename);
  }

  private async replace(
    templateFile: File,
    mapFile: File,
    placeholders: {
      type: 'string';
      key: string;
      value: string;
    }[],
    documentFileName: string,
  ): Promise<File> {
    const pythonPath = path.join(__dirname, 'python-pptx-handler', 'parse.py');
    const templateBuffer = await templateFile.arrayBuffer();
    const mapBuffer = await mapFile.arrayBuffer();
    const normalizedPlaceholders = Object.fromEntries(
      Object.entries(placeholders ?? {}).map(([key, value]) => [key.trim(), value]),
    );
    const proc = spawn(['python3', pythonPath, '--stdin'], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    // Write length-prefixed protocol:
    // 1. Template size (8 bytes, big-endian)
    const templateSize = new DataView(new ArrayBuffer(8));
    templateSize.setBigUint64(0, BigInt(templateBuffer.byteLength), false); // false = big-endian
    proc.stdin.write(new Uint8Array(templateSize.buffer));

    // 2. Template data
    proc.stdin.write(new Uint8Array(templateBuffer));

    // 3. Map size (8 bytes, big-endian)
    const mapSize = new DataView(new ArrayBuffer(8));
    mapSize.setBigUint64(0, BigInt(mapBuffer.byteLength), false);
    proc.stdin.write(new Uint8Array(mapSize.buffer));

    // 4. Map data
    proc.stdin.write(new Uint8Array(mapBuffer));

    // 5. Placeholder

    const placeholdersJson =
      Object.keys(normalizedPlaceholders).length > 0 ? JSON.stringify(normalizedPlaceholders) : '';
    const placeholdersBuffer = placeholdersJson ? new TextEncoder().encode(placeholdersJson) : undefined;

    if (placeholdersBuffer) {
      const placeholdersSize = new DataView(new ArrayBuffer(8));
      placeholdersSize.setBigUint64(0, BigInt(placeholdersBuffer.byteLength), false);
      proc.stdin.write(new Uint8Array(placeholdersSize.buffer));
      proc.stdin.write(placeholdersBuffer);
    }
    proc.stdin.end();

    const buffer = await new Response(proc.stdout).arrayBuffer();
    const stderr = await new Response(proc.stderr).text();

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.error('Python script stderr:', stderr);
      throw new Error(`Python script failed with exit code ${exitCode}`);
    }

    console.log('Python script stderr:', stderr);

    return new File([buffer], documentFileName, {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
  }
}
