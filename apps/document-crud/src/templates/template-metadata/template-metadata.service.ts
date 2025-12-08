import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TemplateMetadata, TemplateMetadataDocument, TemplateMetadataType } from './template-metadata.schema';
import { PlaceholderType } from '@auto-document/types/document';

@Injectable()
export class TemplateMetadataService {
  constructor(
    @InjectModel(TemplateMetadata.name)
    private readonly templateMetadataModel: Model<TemplateMetadataDocument>,
  ) {}

  async create(templateMetadata: Omit<TemplateMetadataType, 'id'>): Promise<TemplateMetadataType> {
    const document = await this.templateMetadataModel.create(templateMetadata);

    return {
      id: document._id.toString(),
      name: document.name,
      path: document.path,
      placeholders: document.placeholders,
    };
  }

  async getById(id: string): Promise<TemplateMetadataType | undefined> {
    const document = await this.templateMetadataModel.findById(id).lean().exec();
    if (!document) {
      return undefined;
    }
    return {
      id: document._id.toString(),
      name: document.name,
      path: document.path,
      placeholders: document.placeholders,
    };
  }

  async getByName(name: string): Promise<TemplateMetadataType | undefined> {
    const document = await this.templateMetadataModel.findOne({ name }).lean().exec();
    if (!document) {
      return undefined;
    }
    return {
      id: document._id.toString(),
      name: document.name,
      path: document.path,
      placeholders: document.placeholders,
    };
  }

  async list(): Promise<TemplateMetadataType[]> {
    const documents = await this.templateMetadataModel.find().lean().exec();
    return documents.map(document => ({
      id: document._id.toString(),
      name: document.name,
      path: document.path,
      placeholders: document.placeholders,
    }));
  }

  async update(id: string, templateMetadata: Partial<Omit<TemplateMetadataType, 'id'>>): Promise<void> {
    await this.templateMetadataModel.findByIdAndUpdate(id, templateMetadata, {
      new: true,
    });
  }

  async delete(id: string): Promise<void> {
    await this.templateMetadataModel.findByIdAndDelete(id);
  }
}
