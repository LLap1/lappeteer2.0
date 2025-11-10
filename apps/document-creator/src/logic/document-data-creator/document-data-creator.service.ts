import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { base64ToFile } from 'src/models/file.model';
import { MapFunctionCaller } from 'src/models/map.model';
import { PageFucntionCaller } from 'src/models/page.model';
import { config } from 'src/config';
import { v4 as uuidv4 } from 'uuid';
import { CreateDocumentsDataInput, CreateDocumentsInput } from 'src/orpc/routers/documents/documents.router.schema';
import { CreateDocumentsDataOutput } from './document-data-creator.model';

@Injectable()
export class DocumentDataCreatorService {
  private cluster!: Cluster;
  private readonly config: Config['puppeteerDocumentCreateor'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<Config['puppeteerDocumentCreateor']>('puppeteerDocumentCreateor')!;
  }
  async onModuleInit() {
    this.cluster = await Cluster.launch(this.config.launchOptions);
  }

  async create(input: CreateDocumentsDataInput): Promise<CreateDocumentsDataOutput> {
    const data: CreateDocumentsDataOutput = await this.cluster.execute(input, async ({ page }) =>
      this.createDocumentData(page, input),
    );
    return data;
  }

  private async createDocumentData(page: Page, inputs: CreateDocumentsDataInput): Promise<CreateDocumentsDataOutput> {
    const pageFunctionCaller = new PageFucntionCaller(page);
    await pageFunctionCaller.goto(config.puppeteerDocumentCreateor.mapPoolUrl);
    const ids = inputs.map(() => uuidv4());
    await pageFunctionCaller.createMapPool(ids);
    const files = await Promise.all(inputs.map((input, index) => this.createDocument(page, input, ids[index])));
    return files;
  }

  private async createDocument(
    page: Page,
    input: CreateDocumentsDataInput[number],
    id: string,
  ): Promise<CreateDocumentsDataOutput[number]> {
    const mapFunctionCaller = new MapFunctionCaller(page, id);
    await mapFunctionCaller.addTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    input.map.value.geojson?.forEach(geojson => mapFunctionCaller.addGeoJsonLayer(geojson));
    await mapFunctionCaller.setView({ center: input.map.value.center, zoom: input.map.value.zoom });
    await mapFunctionCaller.setMapSize({ width: 600, height: 600 });
    await mapFunctionCaller.waitForTilelayersToLoad();
    const screenshotDataUrl = await mapFunctionCaller.exportMap();
    const file = base64ToFile(screenshotDataUrl, input.map.value.filename);
    return {
      filename: input.map.value.filename,
      map: {
        type: 'map',
        key: input.map.key,
        map: file,
      },
      strings: input.strings,
    };
  }
}
