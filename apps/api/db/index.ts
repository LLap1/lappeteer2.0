import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import env from '../env';
// import { seed } from './seed';

// Create the postgres client
const client = postgres(env.DATABASE_URL, {
  max: 10,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create the drizzle instance
export const db = drizzle(client, { schema });

// seed()
//   .then(() => {
//     console.log('✅ Seed completed');
//     process.exit(0);
//   })
//   .catch(error => {
//     console.error('❌ Seed failed:', error);
//     process.exit(1);
//   });

// Export for use in migrations and other utilities
export { client };
