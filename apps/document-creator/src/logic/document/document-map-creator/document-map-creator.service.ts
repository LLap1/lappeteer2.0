import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { base64ToFile, fileToBase64 } from 'src/models/file.model';
import { MapFunctionCaller } from 'src/models/map.model';
import { PageFucntionCaller } from 'src/models/page.model';
import { config } from 'src/config';
import { v4 as uuidv4 } from 'uuid';
import { CreateDocumentsDataOutput, CreateDocumentMapsInput } from './document-map-creator.model';
import { DocumentTemplatePlaceholder } from 'src/logic/template/template-parser/template-parser.model';
import { CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';

@Injectable()
export class DocumentMapCreatorService {
  private cluster!: Cluster;
  private readonly config: Config['puppeteerDocumentCreateor'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<Config['puppeteerDocumentCreateor']>('puppeteerDocumentCreateor')!;
  }
  async onModuleInit() {
    this.cluster = await Cluster.launch(this.config.launchOptions);
  }

  async create(params: CreateDocumentMapsInput): Promise<CreateDocumentsDataOutput> {
    const data: CreateDocumentsDataOutput = await this.cluster.execute(async ({ page }) =>
      this.createDocumentMap(page, params),
    );
    return data;
  }

  private async createDocumentMap(page: Page, params: CreateDocumentMapsInput): Promise<CreateDocumentsDataOutput> {
    const pageFunctionCaller = new PageFucntionCaller(page);
    await pageFunctionCaller.goto(config.puppeteerDocumentCreateor.mapPoolUrl);
    const pool = params.map(param => ({
      id: param.key,
      width: param.creationData.width,
      height: param.creationData.height,
    }));

    await pageFunctionCaller.createMapPool(pool);
    const results = inputs.data.map(input => ({
      filename: input.filename,
      map: new Array<{ type: 'map'; key: string; value: string }>(input.map.length),
      strings: input.strings,
    }));

    let poolCursor = 0;
    const mapTasks: Promise<void>[] = [];

    inputs.data.forEach((input, inputIndex) => {
      input.map.forEach((map, mapIndex) => {
        const poolEntry = pool[poolCursor++];
        mapTasks.push(
          this.createDocument(page, map.creationData, poolEntry.id).then(value => {
            results[inputIndex].map[mapIndex] = {
              type: 'map',
              key: map.key,
              value,
            };
          }),
        );
      });
    });

    await Promise.all(mapTasks);

    return results;
  }

  private async createDocument(
    page: Page,
    input: {
      center: [number, number];
      zoom?: number | undefined;
      geojson?: any[] | undefined;
    },
    id: string,
  ): Promise<string> {
    const mapFunctionCaller = new MapFunctionCaller(page, id);
    await mapFunctionCaller.setView({ center: input.center, zoom: input.zoom });
    await mapFunctionCaller.addTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    const geojsonLayersPromises = input.geojson?.map(geojson => mapFunctionCaller.addGeoJsonLayer(geojson));
    await Promise.all(geojsonLayersPromises ?? []);
    await mapFunctionCaller.waitForTilelayersToLoad();
    const screenshotDataUrl: string = await mapFunctionCaller.exportMap();
    const base64 = screenshotDataUrl.split(',')[1];
    return base64;
  }
}
