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
  },
});
