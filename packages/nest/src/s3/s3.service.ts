import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';
import { FileStorageService } from '../file/file.service';

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
    return new File([file], file.name!, { type: file.type });
  }

  async delete(path: string): Promise<void> {
    this.s3Client.file(path).delete();
  }
}
