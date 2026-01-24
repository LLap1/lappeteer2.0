import { AppModule } from './services/app.module';
import { config } from './config';
import router from '@auto-document/domain/document-crud.router';
import { runCrud } from '@auto-document/bootstrap/crud';
import jsdom from 'jsdom';
import { createCanvas } from 'canvas';

const { window } = new jsdom.JSDOM('<!DOCTYPE html><html><body><div id="map"></div></body></html>');
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = { userAgent: 'node.js' };

// Patch Leaflet's createElement to use canvas
(global as any).HTMLCanvasElement = createCanvas;

runCrud({
  config,
  appModule: AppModule,
  appRouter: router,
});
