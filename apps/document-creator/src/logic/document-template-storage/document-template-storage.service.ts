import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import { mkdir } from 'fs/promises';
import { saveFile, loadFile } from 'src/models/file.model';

@Injectable()
export class DocumentTemplateStorageService implements OnModuleInit {
  private readonly storageDir = path.join(process.cwd(), 'storage', 'templates');

  async onModuleInit() {
    await mkdir(this.storageDir, { recursive: true });
  }

  async download(filename: string): Promise<File> {
    const filePath = path.join(this.storageDir, filename);
    return loadFile(filePath, filename, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  }
}
