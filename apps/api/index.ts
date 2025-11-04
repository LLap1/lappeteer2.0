import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/_app';
import env from './env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, 'public')));

app.use('/trpc', trpcExpress.createExpressMiddleware({ router: appRouter, createContext }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
// Catch-all handler: send back React's index.html file for any non-API routes
app.use((req, res, next) => {
  // Don't serve the React app for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/trpc')) {
    return next(); // Let Express handle the 404
  }

  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'), err => {
    if (err) {
      res.status(500).send('Error serving frontend');
    }
  });
});

const startServer = async () => {
  //   await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
