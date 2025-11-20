import { Injectable } from '@nestjs/common';
import { spawn, SpawnOptions } from 'bun';

@Injectable()
export class ProcessService {
  async run(command: string[], inputs: ArrayBufferLike[]): Promise<ArrayBufferLike> {
    const process = spawn(command, {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    for (const input of inputs) {
      this.write(process, input);
    }

    process.stdin.end();

    const buffer = await new Response(process.stdout).arrayBuffer();
    const stderr = await new Response(process.stderr).text();
    const exitCode = await process.exited;
    process.kill();

    if (exitCode === 1) {
      throw new Error(stderr);
    } else {
      return buffer;
    }
  }

  private write(process: Bun.Subprocess<'pipe', 'pipe', 'pipe'>, data: ArrayBufferLike): void {
    const size = new DataView(new ArrayBuffer(8));
    size.setBigUint64(0, BigInt(data.byteLength), false);
    process.stdin.write(new Uint8Array(size.buffer));
    process.stdin.write(data);
  }
}
