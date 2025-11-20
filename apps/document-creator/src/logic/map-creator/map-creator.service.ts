import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { MapFunctionCaller } from 'src/models/map.model';
import { PageFucntionCaller } from 'src/models/page.model';
import { config } from 'src/config';
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
            await this.createMapPool(page, chunk);
            return this.createMaps(page, chunk);
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

  private async createMaps(page: Page, params: CreateMapParams[]): Promise<{ id: string; base64: string }[]> {
    const mapTasks = params.map(param => this.createMap(page, param));
    const maps = await Promise.all(mapTasks);
    return maps;
  }

  private async createMapPool(page: Page, params: CreateMapParams[]): Promise<void> {
    const pageFunctionCaller = new PageFucntionCaller(page);
    await pageFunctionCaller.goto(config.puppeteerDocumentCreateor.mapPoolUrl);
    await pageFunctionCaller.createMapPool(params);
  }

  private async createMap(page: Page, params: CreateMapParams): Promise<{ id: string; base64: string }> {
    const mapFunctionCaller = new MapFunctionCaller(page, params.id);
    await mapFunctionCaller.setView({ center: params.center, zoom: params.zoom });
    await mapFunctionCaller.addTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    params.geojson.forEach(async geojson => await mapFunctionCaller.addGeoJsonLayer(geojson));
    await mapFunctionCaller.waitForTilelayersToLoad();
    const screenshotDataUrl: string = await mapFunctionCaller.exportMap();
    await mapFunctionCaller.removeLayers();
    const base64 = screenshotDataUrl.split(',')[1];
    return {
      id: params.id,
      base64,
    };
  }
}
