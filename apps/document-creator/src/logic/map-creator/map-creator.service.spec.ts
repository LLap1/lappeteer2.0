import { Test, TestingModule } from '@nestjs/testing';
import { MapCreatorService } from './map-creator.service';
import { ConfigService } from '@nestjs/config';
import { Cluster } from 'puppeteer-cluster';
import { Page } from 'puppeteer';
import { createDocuments } from 'src/models/puppeteer.model';
import { jest } from '@jest/globals';
import { MIME_TYPES, DEFAULT_FILENAMES, FILE_EXTENSIONS } from 'src/models/file.model';
jest.mock('puppeteer-cluster');
jest.mock('src/models/puppeteer.model');

describe('PuppeteerDocumentCreatorService', () => {
  let service: MapCreatorService;
  let configService: ConfigService;
  let mockCluster: jest.Mocked<Cluster>;

  const mockConfig = {
    mapUrl: 'http://localhost:8080',
    launchOptions: {
      concurrency: 1,
      maxConcurrency: 2,
      puppeteerOptions: {
        headless: true,
      },
    },
  };

  beforeEach(async () => {
    mockCluster = {
      execute: jest.fn(),
      launch: jest.fn(),
    } as any;

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

  describe('onModuleInit', () => {
    it('should initialize the cluster with config', async () => {
      await service.onModuleInit();

      expect(Cluster.launch).toHaveBeenCalledWith(mockConfig.launchOptions);
      expect(service['cluster']).toBe(mockCluster);
    });

    it('should get config from ConfigService', async () => {
      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith('puppeteerDocumentCreateor');
    });
  });

  describe('createDocument', () => {
    const mockInput = [
      { filename: `test-1${FILE_EXTENSIONS.PNG}`, center: [51.505, -0.09] as [number, number] },
      { filename: `test-2${FILE_EXTENSIONS.PNG}`, center: [48.8566, 2.3522] as [number, number], zoom: 12 },
    ];
    const mockZipFile = new File([new Blob(['test'])], DEFAULT_FILENAMES.DOCUMENTS_ZIP, { type: MIME_TYPES.ZIP });

    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should execute cluster with correct data and handler', async () => {
      mockCluster.execute.mockResolvedValue(mockZipFile);

      const result = await service.create(mockInput);

      expect(mockCluster.execute).toHaveBeenCalledWith(mockInput, expect.any(Function));
      expect(result).toBe(mockZipFile);
    });

    it('should call createDocuments with page and data', async () => {
      const mockPage = {} as Page;
      (createDocuments as jest.Mock).mockResolvedValue(mockZipFile);

      mockCluster.execute.mockImplementation(async (data, handler) => {
        return handler({ page: mockPage, data });
      });

      await service.create(mockInput);

      expect(createDocuments).toHaveBeenCalledWith(mockPage, mockInput);
    });

    it('should handle errors from cluster execution', async () => {
      const error = new Error('Cluster execution failed');
      mockCluster.execute.mockRejectedValue(error);

      await expect(service.create(mockInput)).rejects.toThrow('Cluster execution failed');
    });

    it('should return the zip file from createDocuments', async () => {
      mockCluster.execute.mockResolvedValue(mockZipFile);

      const result = await service.create(mockInput);

      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe(MIME_TYPES.ZIP);
      expect(result.name).toBe(DEFAULT_FILENAMES.DOCUMENTS_ZIP);
    });
  });
});
