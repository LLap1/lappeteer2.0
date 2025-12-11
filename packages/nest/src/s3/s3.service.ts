import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';
import { FileStorageService } from '../file/file.service';
import { basename } from 'path';

@Injectable()
export class S3Service implements FileStorageService {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File, path: string): Promise<void> {
    this.s3Client.file(path).write(file, {
      type: file.type,
    });
  }

  async download(path: string): Promise<File> {
    const file = this.s3Client.file(path);
    const arrayBuffer = await file.arrayBuffer();
    const filename = basename(path);
    return new File([new Blob([arrayBuffer])], filename, { type: file.type });
  }

  async delete(path: string): Promise<void> {
    this.s3Client.file(path).delete();
  }
}
