import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { PlaceholderMetadata, PlaceholderType } from '@auto-document/types/document';

export const templatesTable = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  placeholders: jsonb('placeholders').$type<PlaceholderMetadata<PlaceholderType>[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
