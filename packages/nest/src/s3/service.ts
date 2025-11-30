import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';

@Injectable()
export class S3Service {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File): Promise<number> {
    return this.s3Client.file(file.name).write(file, {
      type: file.type,
    });
  }

  async download(key: string): Promise<File> {
    const file = this.s3Client.file(key);
    const arrayBuffer = await file.arrayBuffer();
    return new File([new Blob([arrayBuffer])], file.name!, { type: file.type });
  }

  async delete(key: string): Promise<void> {
    return this.s3Client.file(key).delete();
  }
}
