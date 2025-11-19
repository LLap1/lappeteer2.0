import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';

@Injectable()
export class S3Service {
  constructor(private readonly s3Client: S3Client) {}

  upload(file: File): Promise<number> {
    return this.s3Client.file(file.name).write(file);
  }

  download(key: string): Promise<ArrayBufferLike> {
    return this.s3Client.file(key).arrayBuffer();
  }

  delete(key: string): Promise<void> {
    return this.s3Client.file(key).delete();
  }
}
