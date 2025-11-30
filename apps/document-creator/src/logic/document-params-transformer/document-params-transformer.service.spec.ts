import { Test, TestingModule } from '@nestjs/testing';
import { DocumentParamsTransformerService } from './document-params-transformer.service';
import { MapCreatorService } from '../map-creator/map-creator.service';
import type { CreateDocumentsInput } from '../document-creator/documents.router.schema';
import type { TemplatePlaceholder } from '@auto-document/types/template';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('DocumentParamsTransformerService', () => {
  let service: DocumentParamsTransformerService;
  let mapCreatorService: jest.Mocked<MapCreatorService>;

  beforeEach(async () => {
    const mockMapCreatorService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentParamsTransformerService,
        {
          provide: MapCreatorService,
          useValue: mockMapCreatorService,
        },
      ],
    }).compile();

    service = module.get<DocumentParamsTransformerService>(DocumentParamsTransformerService);
    mapCreatorService = module.get(MapCreatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transform', () => {
    it('should populate params with IDs', async () => {
      const mockFile = new File(['template'], 'template.pptx');
      const input: CreateDocumentsInput = {
        templateFile: mockFile,
        placeholders: [],
        data: [
          {
            filename: 'test.pptx',
            placeholderData: [{ type: 'text', key: 'title', id: null, width: null, height: null, value: 'Test' }],
          },
        ],
      };

      const placeholders: TemplatePlaceholder[] = [];

      const result = await service.transform(input, placeholders);

      expect(result.data[0].placeholderData[0].id).toBeTruthy();
      expect(result.data[0].placeholderData[0].id).not.toBeNull();
    });

    it('should populate params with placeholder dimensions', async () => {
      const mockFile = new File(['template'], 'template.pptx');
      const input: CreateDocumentsInput = {
        templateFile: mockFile,
        placeholders: [],
        data: [
          {
            filename: 'test.pptx',
            placeholderData: [{ type: 'text', key: 'title', id: null, width: null, height: null, value: 'Test' }],
          },
        ],
      };

      const placeholders: TemplatePlaceholder[] = [{ key: 'title', type: 'text', width: 100, height: 50 }];

      const result = await service.transform(input, placeholders);

      expect(result.data[0].placeholderData[0].width).toBe(100);
      expect(result.data[0].placeholderData[0].height).toBe(50);
    });

    it('should throw error if placeholder not found', async () => {
      const mockFile = new File(['template'], 'template.pptx');
      const input: CreateDocumentsInput = {
        templateFile: mockFile,
        placeholders: [],
        data: [
          {
            filename: 'test.pptx',
            placeholderData: [{ type: 'text', key: 'missing', id: null, width: null, height: null, value: 'Test' }],
          },
        ],
      };

      const placeholders: TemplatePlaceholder[] = [{ key: 'title', type: 'text', width: 100, height: 50 }];

      await expect(service.transform(input, placeholders)).rejects.toThrow('Placeholder missing not found in template');
    });

    it('should populate map placeholders with map data', async () => {
      const mockFile = new File(['template'], 'template.pptx');
      const mapId = 'map-1';
      const input: CreateDocumentsInput = {
        templateFile: mockFile,
        placeholders: [],
        data: [
          {
            filename: 'test.pptx',
            placeholderData: [
              {
                type: 'map',
                key: 'map',
                id: mapId,
                width: 200,
                height: 150,
                value: {
                  center: [51.505, -0.09],
                  zoom: 10,
                  geojson: [],
                },
              },
            ],
          },
        ],
      };

      const placeholders: TemplatePlaceholder[] = [{ key: 'map', type: 'map', width: 200, height: 150 }];

      const mockMapData = [{ id: mapId, dataUrl: 'data:image/png;base64,test' }];
      mapCreatorService.create.mockResolvedValue(mockMapData);

      const result = await service.transform(input, placeholders);

      expect(mapCreatorService.create).toHaveBeenCalledWith([
        {
          id: mapId,
          width: 200,
          height: 150,
          center: [51.505, -0.09],
          zoom: 10,
          geojson: [],
        },
      ]);
      expect(result.data[0].placeholderData[0].value).toBe('data:image/png;base64,test');
    });

    it('should handle multiple data entries', async () => {
      const mockFile = new File(['template'], 'template.pptx');
      const input: CreateDocumentsInput = {
        templateFile: mockFile,
        placeholders: [],
        data: [
          {
            filename: 'test1.pptx',
            placeholderData: [{ type: 'text', key: 'title', id: null, width: null, height: null, value: 'Test 1' }],
          },
          {
            filename: 'test2.pptx',
            placeholderData: [{ type: 'text', key: 'title', id: null, width: null, height: null, value: 'Test 2' }],
          },
        ],
      };

      const placeholders: TemplatePlaceholder[] = [{ key: 'title', type: 'text', width: 100, height: 50 }];

      const result = await service.transform(input, placeholders);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].filename).toBe('test1.pptx');
      expect(result.data[1].filename).toBe('test2.pptx');
    });
  });
});
