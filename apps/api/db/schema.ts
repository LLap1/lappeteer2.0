import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
