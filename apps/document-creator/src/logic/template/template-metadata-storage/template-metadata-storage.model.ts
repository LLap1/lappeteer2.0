import { DocumentTemplatePlaceholder } from '../template-parser/template-parser.model';

export type TemplateMetadata = {
  name: string;
  path: string;
  placeholders: DocumentTemplatePlaceholder[];
};
