import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import { FileService } from 'src/logic/file/file-storage.service';

@Injectable()
export class TemplateFileService {
  private readonly storageDir = path.join(process.cwd(), 'storage', 'templates');

  constructor(private readonly fileService: FileService) {}

  async download(fileName: string): Promise<File> {
    const filePath = path.join(this.storageDir, fileName);
    return this.fileService.read(filePath);
  }

  async upload(file: File): Promise<string> {
    const filePath = path.join(this.storageDir, file.name);
    await this.fileService.save(file, filePath);
    return filePath;
  }
}
