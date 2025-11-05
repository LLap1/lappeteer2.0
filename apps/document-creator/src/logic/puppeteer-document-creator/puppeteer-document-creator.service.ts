import { Injectable } from '@nestjs/common';
import { DocumentCreatorService } from '../document-creator/document-creator.model';
import { CreateDocumentInput, CreateDocumentOutput } from 'src/routers/documents/documents.router.schema';
import puppeteer, { Browser } from 'puppeteer';
import { createDocumentPipeline } from 'src/models/puppeteer.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PuppeteerDocumentCreatorService implements DocumentCreatorService {
  private browser!: Browser;

  async onModuleInit() {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async createDocument(input: CreateDocumentInput): Promise<CreateDocumentOutput> {
    const page = await this.browser.newPage();
    const pipeline = createDocumentPipeline(page, input);
    const screenshot = await firstValueFrom(createDocumentPipeline(page, input));
    return screenshot;
  }
}
