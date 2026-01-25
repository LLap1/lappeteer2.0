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
            return this.createMapCanvases(actionSender, page, chunk as CreateMapsInput);
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
    page: Page,
    params: CreateMapsInput,
  ): Promise<CreateMapsOutput> {
    const mapTasks = params.map(param => this.createMap(controlSender, page, param));
    const maps = await Promise.all(mapTasks);
    return maps;
  }

  private async createMap(
    windowActionSender: WindowActionSender,
    page: Page,
    params: CreateMapsInput[number],
  ): Promise<CreateMapsOutput[number]> {
    const { id, width, height, intrestPolygonCollection } = params;

    const overlay = await this.overlaysService.getById({ id: params.overlayId });

    const wmsUrl = await this.overlaysService.buildPixelWmsUrl({
      overlayId: params.overlayId,
      bbox: bbox(intrestPolygonCollection),
      width: Math.round(width),
      height: Math.round(height),
      layers: [overlay.id],
      format: 'image/png',
    });

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

    await page.evaluate(() => {
      document.querySelector('.leaflet-control-container')?.remove();
    });

    await windowActionSender.send({
      type: 'setView',
      params: { id, bounds: [pixelBbox[1], pixelBbox[0], pixelBbox[3], pixelBbox[2]] },
    });

    if (params.rotation) {
      await windowActionSender.send({ type: 'rotateMap', params: { id, rotation: params.rotation } });
    }

    await windowActionSender.send({
      type: 'addWmsLayer',
      params: { id, wmsUrl, options: { format: 'image/png', layers: overlay.id } },
    });

    await windowActionSender.send({ type: 'waitForTilelayersToLoad', params: { id } });
    const mapElement = await page.$(`[id="${id}"]`);

    await windowActionSender.send({ type: 'hidePane', params: { id, pane: 'tooltipPane' } });
    await windowActionSender.send({ type: 'hidePane', params: { id, pane: 'popupPane' } });
    await windowActionSender.send({ type: 'hidePane', params: { id, pane: 'overlayPane' } });

    const tilesOnlyFilePath = path.join('/tmp', `map-tiles-only-${id}.png`);
    await mapElement!.screenshot({
      path: tilesOnlyFilePath,
      omitBackground: true,
    });

    const layers: ImageLayer[] = [{ path: tilesOnlyFilePath, offsetX: 0, offsetY: 0, width, height }];

    await windowActionSender.send({ type: 'revealPane', params: { id, pane: 'overlayPane' } });
    await windowActionSender.send({ type: 'hidePane', params: { id, pane: 'tilePane' } });

    await windowActionSender.send({
      type: 'addGeoJsonLayer',
      params: { id, geojson: pixelInterestPolygonCollection as any },
    });

    const geoJsonSvgs = await page.$$(
      `[id="${id}"] > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-rotate-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path`,
    );

    for (const geoJsonSvg of geoJsonSvgs) {
      await geoJsonSvg.evaluate(el => {
        (el as HTMLElement).hidden = true;
      });
      const overlayFilePath = path.join('/tmp', `map-overlay-${id}-${uuidv4()}.png`);
      await mapElement!.screenshot({
        path: overlayFilePath,
        omitBackground: true,
      });
      layers.push({ path: overlayFilePath, offsetX: 0, offsetY: 0, width, height });
      await geoJsonSvg.evaluate(el => {
        (el as HTMLElement).hidden = false;
      });
    }

    await windowActionSender.send({ type: 'removeLayers', params: { id } });

    return { id, layers };
  }
}
