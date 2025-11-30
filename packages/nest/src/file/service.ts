import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  async read(filePath: string): Promise<File> {
    const file = Bun.file(filePath);
    return new File([await file.arrayBuffer()], file.name!, { type: file.type });
  }

  async save(file: File, filePath: string): Promise<void> {
    await Bun.write(filePath, file);
  }
}

