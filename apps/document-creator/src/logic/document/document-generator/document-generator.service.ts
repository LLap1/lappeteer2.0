import { Injectable } from '@nestjs/common';
import { spawn } from 'bun';
import path from 'path';
import { GenerateDocumentInput, GenerateDocumentOutput } from './document-generator.model';

@Injectable()
export class DocumentGeneratorService {
  async generate(input: GenerateDocumentInput): Promise<GenerateDocumentOutput> {
    const pythonPath = path.join(__dirname, 'generate.py');
    const templateBuffer = await input.templateFile.arrayBuffer();

    const proc = spawn(['python3', pythonPath], {
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

    // 3. Parse Data
    const parseData = new TextEncoder().encode(JSON.stringify(input));
    const parseDataSize = new DataView(new ArrayBuffer(8));
    parseDataSize.setBigUint64(0, BigInt(parseData.byteLength), false);
    proc.stdin.write(new Uint8Array(parseDataSize.buffer));
    proc.stdin.write(parseData);

    proc.stdin.end();

    const buffer = await new Response(proc.stdout).arrayBuffer();
    const stderr = await new Response(proc.stderr).text();

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.error('Python script stderr:', stderr);
      throw new Error(`Python script failed with exit code ${exitCode}`);
    }

    console.log('Python script stderr:', stderr);

    return new File([buffer], input.data.filename, {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
  }
}
