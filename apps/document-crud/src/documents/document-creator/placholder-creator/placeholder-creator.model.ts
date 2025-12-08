import type { PlaceholderMetadata, Placeholder } from '@auto-document/types/document';
import { PathOptions } from 'leaflet';
import { Feature, Geometry } from 'geojson';
import type { PlaceholderType } from '@auto-document/types/document';
import { CreatePlaceholderParams } from 'src/documents/documents.router.schema';

export type PlaceholderParams<T extends PlaceholderType = PlaceholderType> = PlaceholderMetadata<T> & {
  id: string;
  params: T extends 'map' ? MapPlaceholderParams : T extends 'text' ? TextPlaceholderParams : ImagePlaceholderParams;
};
export type MapPlaceholderParams = {
  center: [number, number];
  zoom: number;
  geojson: Feature<Geometry | null, { style?: PathOptions } | null>[];
};

export type TextPlaceholderParams = string;
export type ImagePlaceholderParams = string;

// export class MapPlaceholderCreator extends PlaceholderCreator<'map'> {
//   constructor(@Inject(ORPC_CLIENT) private readonly orpcClient: Client) {
//     super();
//   }

//   async create(
//     3s: PlaceholderParams<'map'>[],
//     emptyPlaceholder: PlaceholderMetadata<'map'>,
//   ): Promise<Placeholder<'map'>[]> {
//     const paramsWithIds: (PlaceholderParams<'map'> & { id: string })[] = params.map(param => ({
//       ...param,
//       id: uuidv4(),
//     }));
//     const maps = await Promise.all(paramsWithIds.map(param => this.createMap(param)));

//     const placeholders = maps.map(map => ({
//       type: 'map',
//       value: map,
//     }));

//     return placeholders;
//   }

//   private createMap(params: PlaceholderParams<'map'>[]): Promise<
//     {
//       id: string;
//       layerDataUrls: string[];
//     }[]
//   > {
//     const mapParams = params.map(param => ({
//       id: param.id,
//       width: param.width,
//       height: param.height,
//       center: param.center,
//       zoom: param.zoom,
//       geojson: param.geojson,
//     }));
//     return this.orpcClient.documentMapCreator.create(params);
//   }
// }
