import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { templatesTable } from './templates.schema';

export const documentsTable = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  templateId: uuid('tempalte_id')
    .references(() => templatesTable.id)
    .notNull(),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
