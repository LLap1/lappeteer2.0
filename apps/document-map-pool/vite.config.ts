import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { config } from './config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    preact({
      prerender: {
        enabled: false,
      },
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  server: {
    port: config.server.port,
    proxy: {
      '/ows': {
        target: 'http://localhost:8080/geoserver/ows',
        changeOrigin: true,
        secure: false,
      },
      '/wms': {
        target: 'http://localhost:8080/geoserver/ne/wms',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
