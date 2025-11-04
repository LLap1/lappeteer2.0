import * as esbuild from 'esbuild';
import { exit } from 'node:process';

try {
  await esbuild.build({
    entryPoints: ['./index.ts'],
    bundle: true,
    sourcemap: true,
    minify: false,
    platform: 'node',
    target: 'node20',
    packages: 'external',
    define: {
      'process.env.NODE_ENV': "'production'",
    },
    outfile: './dist/index.js',
    format: 'esm',
  });

  process.stdout.write('Server bundled successfully for production! 🚀\n');
} catch (error) {
  process.stderr.write(`An error occurred during bundling: ${error}\n`);
  exit(1);
}
