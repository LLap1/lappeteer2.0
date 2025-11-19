import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import { S3Service } from 'src/logic/s3/s3.service';

@Injectable()
export class TemplateFileService {
  constructor(private readonly s3Service: S3Service) {}

  async download(fileName: string): Promise<File> {
    const arrayBuffer = await this.s3Service.download(fileName);
    return new File([new Blob([arrayBuffer as ArrayBuffer])], fileName);
  }

  async upload(file: File): Promise<number> {
    const size = await this.s3Service.upload(file);
    return size;
  }
}
