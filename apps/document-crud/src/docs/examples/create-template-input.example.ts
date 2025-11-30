import { CreateTemplateInput } from '../../logic/template/template.router.schema';

export const createTemplateInputExample: CreateTemplateInput = {
  file: new File(
    [
      new Blob(
        [
          /* In a real example, this would be the actual PowerPoint file bytes */
        ],
        { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      ),
    ],
    'template.pptx',
    { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  ),
};
