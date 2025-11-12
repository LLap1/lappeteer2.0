import { CreateDocumentsDataOutput } from '../document-data-creator/document-data-creator.model';

export type ParseDocumentTemplateInput = {
  templateFile: File;
  data: CreateDocumentsDataOutput[number];
};

export type ParseDocumentTemplateOutput = File;
