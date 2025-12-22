import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { type Config } from 'src/config';
import { chunk } from 'lodash';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { WindowActionSender } from './document-map-creator.model';
import { Base64DataURL } from '@auto-document/types/file';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  type CreateMapsResponse,
  type CreateMapsRequest,
  type DocumentMapCreatorServiceController,
  DocumentMapCreatorServiceControllerMethods,
} from '@auto-document/types/proto/document-map-creator';
import { Log } from '@auto-document/utils/log';

@Controller()
@DocumentMapCreatorServiceControllerMethods()
export class DocumentMapCreatorService implements DocumentMapCreatorServiceController {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  private cluster?: Cluster;

  constructor(@Inject('MAP_CREATOR_CONFIG') private readonly config: Config['MapCreator']) {}

  @GrpcMethod()
  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsRequest): Promise<CreateMapsResponse> {
    if (this.cluster === undefined) {
      this.cluster = await Cluster.launch(this.config.launchOptions);
    }

    const chunks = chunk(request.maps, this.config.mapsPerPage);

    const maps = (
      await Promise.all<CreateMapsOutput>(
        chunks.map(async chunk => {
          return await this.cluster!.execute(async ({ page }: { page: Page }) => {
            const actionSender = new WindowActionSender(page);
            await page.goto(this.config.mapPoolUrl);
            await actionSender.send({ type: 'createMapPool', params: chunk });
            return this.createMapCanvases(actionSender, chunk as CreateMapsInput);
          });
        }),
      )
    ).flat();

    this.cluster?.idle().then(() => {
      this.cluster?.close();
      this.cluster = undefined;
    });

    return { maps };
  }

  private async createMapCanvases(
    controlSender: WindowActionSender,
    params: CreateMapsInput,
  ): Promise<CreateMapsOutput> {
    const mapTasks = params.map(param => this.createMap(controlSender, param));
    const maps = await Promise.all(mapTasks);
    return maps;
  }

  private async createMap(
    windowActionSender: WindowActionSender,
    params: CreateMapsInput[number],
  ): Promise<CreateMapsOutput[number]> {
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
    const layerDataUrls: Base64DataURL[] = await windowActionSender.send({
      type: 'exportMap',
      params: { id: params.id },
    });

    await windowActionSender.send({ type: 'removeLayers', params: { id: params.id } });

    return {
      id: params.id,
      layerDataUrls,
    };
  }
}
