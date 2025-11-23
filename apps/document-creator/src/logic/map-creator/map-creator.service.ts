import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config, config } from 'src/config';
import { WindowActionSender } from 'src/models/control.model';
import { CreateMapParams } from './map-creator.model';
import { chunk } from 'lodash';

@Injectable()
export class MapCreatorService {
  private cluster?: Cluster;
  private readonly config: Config['puppeteerDocumentCreateor'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<Config['puppeteerDocumentCreateor']>('puppeteerDocumentCreateor')!;
  }

  async create(params: CreateMapParams[]): Promise<{ id: string; base64: string }[]> {
    if (this.cluster === undefined) {
      this.cluster = await Cluster.launch(this.config.launchOptions);
    }

    const chunks = chunk(params, 100);

    const maps = (
      await Promise.all<{ id: string; base64: string }[]>(
        chunks.map(async chunk => {
          return await this.cluster!.execute(async ({ page }: { page: Page }) => {
            const actionSender = new WindowActionSender(page);
            await page.goto(config.puppeteerDocumentCreateor.mapPoolUrl);
            await actionSender.send({ type: 'createMapPool', params: chunk });
            return this.createMapCanvases(actionSender, chunk);
          });
        }),
      )
    ).flat();

    this.cluster?.idle().then(() => {
      this.cluster?.close();
      this.cluster = undefined;
    });

    return maps;
  }

  private async createMapCanvases(
    controlSender: WindowActionSender,
    params: CreateMapParams[],
  ): Promise<{ id: string; base64: string }[]> {
    const mapTasks = params.map(param => this.createMap(controlSender, param));
    const maps = await Promise.all(mapTasks);
    return maps;
  }

  private async createMap(
    windowActionSender: WindowActionSender,
    params: CreateMapParams,
  ): Promise<{ id: string; base64: string }> {
    await windowActionSender.send({
      type: 'setView',
      params: { id: params.id, center: params.center, zoom: params.zoom },
    });
    await windowActionSender.send({
      type: 'addTileLayer',
      params: { id: params.id, url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' },
    });
    params.geojson.forEach(
      async geojson => await windowActionSender.send({ type: 'addGeoJsonLayer', params: { id: params.id, geojson } }),
    );
    await windowActionSender.send({ type: 'waitForTilelayersToLoad', params: { id: params.id } });
    const screenshotDataUrl: string = await windowActionSender.send({ type: 'exportMap', params: { id: params.id } });
    await windowActionSender.send({ type: 'removeLayers', params: { id: params.id } });
    const base64 = screenshotDataUrl.split(',')[1];
    return {
      id: params.id,
      base64,
    };
  }
}
