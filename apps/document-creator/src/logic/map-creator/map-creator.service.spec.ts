import { Test, TestingModule } from '@nestjs/testing';
import { MapCreatorService } from './map-creator.service';
import { ConfigService } from '@nestjs/config';
import { Cluster } from 'puppeteer-cluster';
import { Page } from 'puppeteer';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { CreateMapParams } from './map-creator.model';

jest.mock('puppeteer-cluster');

describe('MapCreatorService', () => {
  let service: MapCreatorService;
  let configService: ConfigService;
  let mockCluster: any;

  const mockConfig = {
    mapPoolUrl: 'http://localhost:8080',
    launchOptions: {
      concurrency: 1,
      maxConcurrency: 2,
      puppeteerOptions: {
        headless: true,
        devtools: false,
      },
    },
  };

  beforeEach(async () => {
    mockCluster = {
      execute: jest.fn(),
      idle: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (Cluster.launch as jest.Mock).mockResolvedValue(mockCluster);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapCreatorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockConfig),
          },
        },
      ],
    }).compile();

    service = module.get<MapCreatorService>(MapCreatorService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockParams: CreateMapParams[] = [
      {
        id: 'map-1',
        center: [51.505, -0.09],
        zoom: 10,
        width: 200,
        height: 150,
        geojson: [],
      },
      {
        id: 'map-2',
        center: [48.8566, 2.3522],
        zoom: 12,
        width: 300,
        height: 200,
        geojson: [],
      },
    ];

    it('should launch cluster on first call', async () => {
      const mockPage = { goto: jest.fn(), evaluate: jest.fn() } as unknown as Page;
      const mockResults = [
        { id: 'map-1', dataUrl: 'data:image/png;base64,test1' },
        { id: 'map-2', dataUrl: 'data:image/png;base64,test2' },
      ];

      (mockCluster.execute as any).mockImplementation(async (handler: (args: { page: Page }) => Promise<any>) => {
        return handler({ page: mockPage });
      });

      (mockPage.evaluate as jest.Mock)
        .mockResolvedValue(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any);

      const result = await service.create(mockParams);

      expect(Cluster.launch).toHaveBeenCalledWith(mockConfig.launchOptions);
      expect(result).toHaveLength(2);
    });

    it('should execute cluster with handler function', async () => {
      const mockPage = { goto: jest.fn(), evaluate: jest.fn() } as unknown as Page;
      const mockResults = [
        { id: 'map-1', dataUrl: 'data:image/png;base64,test1' },
        { id: 'map-2', dataUrl: 'data:image/png;base64,test2' },
      ];

      (mockCluster.execute as jest.Mock).mockImplementation(async (handler: (args: { page: Page }) => Promise<any>) => {
        return handler({ page: mockPage });
      });

      (mockPage.evaluate as jest.Mock)
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any);

      const result = await service.create(mockParams);

      expect(mockCluster.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it('should chunk params into groups of 100', async () => {
      const largeParams: CreateMapParams[] = Array.from({ length: 250 }, (_, i) => ({
        id: `map-${i}`,
        center: [51.505, -0.09],
        zoom: 10,
        width: 200,
        height: 150,
        geojson: [],
      }));

      const mockPage = { goto: jest.fn(), evaluate: jest.fn() } as unknown as Page;
      const mockResult = { id: 'map-0', dataUrl: 'data:image/png;base64,test' };

      (mockCluster.execute as jest.Mock).mockImplementation(async (handler: (args: { page: Page }) => Promise<any>) => {
        return handler({ page: mockPage });
      });

      (mockPage.evaluate as jest.Mock).mockResolvedValue(mockResult as any);

      await service.create(largeParams);

      expect(mockCluster.execute).toHaveBeenCalledTimes(3);
    });

    it('should handle errors from cluster execution', async () => {
      const error = new Error('Cluster execution failed');
      (mockCluster.execute as jest.Mock).mockRejectedValue(error as any);

      await expect(service.create(mockParams)).rejects.toThrow('Cluster execution failed');
    });

    it('should schedule cluster cleanup after execution', async () => {
      const mockPage = { goto: jest.fn(), evaluate: jest.fn() } as unknown as Page;
      const mockResults = [
        { id: 'map-1', dataUrl: 'data:image/png;base64,test1' },
        { id: 'map-2', dataUrl: 'data:image/png;base64,test2' },
      ];

      (mockCluster.execute as jest.Mock).mockImplementation(async (handler: (args: { page: Page }) => Promise<any>) => {
        return handler({ page: mockPage });
      });

      (mockPage.evaluate as jest.Mock)
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any);

      await service.create(mockParams);

      expect(mockCluster.idle).toHaveBeenCalled();
    });
  });
});
