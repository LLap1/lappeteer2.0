import { Injectable } from '@nestjs/common';
import { S3Service } from '@auto-document/nest/s3.service';

@Injectable()
export class TemplateFileStorageService {
  constructor(private readonly s3Service: S3Service) {}

  async download(fileName: string): Promise<File> {
    return await this.s3Service.download(fileName);
  }

  async upload(file: File): Promise<void> {
    await this.s3Service.upload(file);
  }

  async delete(fileName: string): Promise<void> {
    await this.s3Service.delete(fileName);
  }
}
