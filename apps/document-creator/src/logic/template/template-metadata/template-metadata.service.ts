import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TemplateMetadata, TemplateMetadataDocument, TemplateMetadataType } from './template-metadata.schema';

@Injectable()
export class TemplateMetadataService {
  constructor(
    @InjectModel(TemplateMetadata.name)
    private readonly templateMetadataModel: Model<TemplateMetadataDocument>,
  ) {}

  async upload(templateFile: TemplateMetadataType): Promise<void> {
    await this.templateMetadataModel.findOneAndUpdate({ name: templateFile.name }, templateFile, {
      upsert: true,
      new: true,
    });
  }

  async get(name: string): Promise<TemplateMetadataType | undefined> {
    const document = await this.templateMetadataModel.findOne({ name }).lean().exec();
    if (!document) {
      return undefined;
    }
    const { _id, __v, ...templateMetadata } = document;
    return templateMetadata as TemplateMetadataType;
  }
}
