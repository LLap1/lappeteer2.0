import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { chunk } from 'lodash';
import type { CreateMapsInput, CreateMapsOutput, ImageLayer } from './document-map-creator.model';
import { WindowActionSender } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import { config } from 'src/config';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bbox from '@turf/bbox';
import { OverlaysService } from 'src/services/overlays/overlays.service';
import { featureCollection } from '@turf/helpers';

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);
  private cluster?: Cluster;

  constructor(private readonly overlaysService: OverlaysService) {}

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    if (this.cluster === undefined) {
      this.cluster = await Cluster.launch(config.documentMapCreator.launchOptions);
      this.cluster.idle().then(() => {
        this.cluster?.close();
        this.cluster = undefined;
      });
    }

    const chunks = chunk(request, 100);

    const maps = (
      await Promise.all<CreateMapsOutput>(
        chunks.map(async chunk => {
          return await this.cluster!.execute(async ({ page }: { page: Page }) => {
            const actionSender = new WindowActionSender(page);
            await page.goto(config.documentMapCreator.mapPoolUrl);

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

    return maps;
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
    const { id, width, height, intrestPolygonCollection } = params;

    const overlay = await this.overlaysService.getById({ id: params.overlayId });
    const tileUrl = overlay.pixelTileUrl;
    const pixelInterestPolygonCollection = featureCollection(
      await Promise.all(
        intrestPolygonCollection.features.map(async feature => {
          const pixelGeometry = await this.overlaysService.groundToImage({
            overlayId: params.overlayId,
            geometry: feature.geometry,
          });
          return {
            ...feature,
            geometry: pixelGeometry,
          };
        }),
      ),
    );

    const pixelBbox = bbox(pixelInterestPolygonCollection);

    await windowActionSender.send({
      type: 'setView',
      params: { id, bounds: [pixelBbox[1], pixelBbox[0], pixelBbox[3], pixelBbox[2]] },
    });

    if (params.rotation) {
      await windowActionSender.send({ type: 'rotateMap', params: { id, rotation: params.rotation } });
    }

    await windowActionSender.send({ type: 'addTileLayer', params: { id, url: tileUrl } });

    for (const feature of pixelInterestPolygonCollection.features) {
      await windowActionSender.send({
        type: 'addGeoJsonLayer',
        params: { id, geojson: feature as any },
      });
    }

    await windowActionSender.send({ type: 'waitForTilelayersToLoad', params: { id } });

    const layerDataUrls: string[] = await windowActionSender.send({
      type: 'exportMap',
      params: { id },
    });

    await windowActionSender.send({ type: 'removeLayers', params: { id } });

    const layers = await this.saveDataUrlsToFiles(layerDataUrls, width, height);

    return { id, layers };
  }

  private async saveDataUrlsToFiles(dataUrls: string[], width: number, height: number): Promise<ImageLayer[]> {
    const layers: ImageLayer[] = [];

    for (const dataUrl of dataUrls) {
      const filePath = await this.dataUrlToFile(dataUrl);
      layers.push({
        path: filePath,
        offsetX: 0,
        offsetY: 0,
        width,
        height,
      });
    }

    return layers;
  }

  private async dataUrlToFile(dataUrl: string): Promise<string> {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join('/tmp', `map-layer-${uuidv4()}.png`);
    await Bun.write(filePath, buffer);
    return filePath;
  }
}
