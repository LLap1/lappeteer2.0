import { Injectable } from '@nestjs/common';
import { DocumentCreatorService } from '../document-creator/document-creator.model';
import { CreateDocumentInput, CreateDocumentOutput } from 'src/routers/documents/documents.router.schema';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createScreenshot } from 'src/models/puppeteer.model';
import { firstValueFrom } from 'rxjs';
import { Cluster } from 'puppeteer-cluster';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';

@Injectable()
export class PuppeteerDocumentCreatorService implements DocumentCreatorService {
  private cluster!: Cluster;
  private readonly config: Config['puppeteerDocumentCreateor'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<Config['puppeteerDocumentCreateor']>('puppeteerDocumentCreateor')!;
  }
  async onModuleInit() {}
  async createDocument(data: CreateDocumentInput): Promise<CreateDocumentOutput> {
    this.cluster = await Cluster.launch(this.config.launchOptions);

    const screenshots: CreateDocumentOutput = await this.cluster.execute(
      data,
      async ({ page, data }: { page: Page; data: CreateDocumentInput }) => {
        const screenshot = await createScreenshot(page);
        return screenshot;
      },
    );

    return screenshots;
  }
}
