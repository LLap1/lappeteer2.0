import { Page } from 'puppeteer';
import type { WindowActions } from '@auto-document/document-map-pool/routers/root';
import { z } from 'zod/v4';
import { Base64DataURLSchema } from '@auto-document/types/file';

export type WindowAction<T extends WindowActions['type'] = WindowActions['type']> = Extract<WindowActions, { type: T }>;

export class WindowActionSender {
  constructor(private readonly page: Page) {}

  async send<T extends WindowActions['type']>(action: WindowAction<T>): Promise<any> {
    const result = await this.page.evaluate((action: WindowActions) => {
      return window[action.type](action.params);
    }, action);
    return result as never;
  }
}

export const CreateMapsInputSchema = z.array(
  z.object({
    id: z.string(),
    width: z.number(),
    height: z.number(),
    center: z.tuple([z.number(), z.number()]),
    zoom: z.number(),
    geojson: z.array(z.any()),
  }),
);

export const CreateMapsOutputSchema = z.array(
  z.object({
    id: z.string(),
    layerDataUrls: z.array(Base64DataURLSchema),
  }),
);

export type CreateMapsInput = z.infer<typeof CreateMapsInputSchema>;
export type CreateMapsOutput = z.infer<typeof CreateMapsOutputSchema>;
