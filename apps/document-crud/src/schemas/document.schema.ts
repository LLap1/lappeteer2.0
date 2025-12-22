import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { templatesTable } from './template.schema';

export const documentsTable = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  templateId: uuid('templateId')
    .references(() => templatesTable.id)
    .notNull(),
  downloadUrl: varchar('downloadUrl', { length: 1024 }).notNull(),
});
