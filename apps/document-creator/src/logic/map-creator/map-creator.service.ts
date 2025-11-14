import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { MapFunctionCaller } from 'src/models/map.model';
import { PageFucntionCaller } from 'src/models/page.model';
import { config } from 'src/config';
import { CreateMapParams } from './map-creator.model';

@Injectable()
export class MapCreatorService {
  private cluster!: Cluster;
  private readonly config: Config['puppeteerDocumentCreateor'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<Config['puppeteerDocumentCreateor']>('puppeteerDocumentCreateor')!;
  }
  async onModuleInit() {
    this.cluster = await Cluster.launch(this.config.launchOptions);
  }

  async create(params: CreateMapParams[]): Promise<{ id: string; base64: string }[]> {
    const maps = await this.cluster.execute(async ({ page }: { page: Page }) => {
      await this.createMapPool(page, params);
      return this.createMaps(page, params);
    });
    console.log('maps', maps);
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
    console.log('params', params);
    const mapFunctionCaller = new MapFunctionCaller(page, params.id);
    await mapFunctionCaller.setView({ center: params.center, zoom: params.zoom });
    await mapFunctionCaller.addTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    params.geojson.forEach(async geojson => await mapFunctionCaller.addGeoJsonLayer(geojson));
    await mapFunctionCaller.waitForTilelayersToLoad();
    await mapFunctionCaller.wait(10);
    const screenshotDataUrl: string = await mapFunctionCaller.exportMap();
    const base64 = screenshotDataUrl.split(',')[1];
    return {
      id: params.id,
      base64,
    };
  }
}
