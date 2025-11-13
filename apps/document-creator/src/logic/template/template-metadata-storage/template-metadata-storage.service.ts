import { Injectable } from '@nestjs/common';
import { TemplateMetadata } from './template-metadata-storage.model';

@Injectable()
export class TemplateMetadataStorageService {
  private readonly storage = new Map<string, TemplateMetadata>();

  async upload(templateFile: TemplateMetadata): Promise<void> {
    this.storage.set(templateFile.name, templateFile);
  }

  async getByName(name: string): Promise<TemplateMetadata | undefined> {
    return this.storage.get(name);
  }
}
