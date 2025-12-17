import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';
import { basename } from 'path';

@Injectable()
export class S3Service {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File, path: string): Promise<number> {
    return this.s3Client.write(path, file, {
      type: file.type,
    });
  }

  async download(path: string): Promise<File> {
    const file = this.s3Client.file(path);
    const fileName = basename(file.name!);
    return new File([await file.arrayBuffer()], fileName, { type: file.type });
  }

  async delete(path: string): Promise<void> {
    this.s3Client.file(path).delete();
  }
}
