import { pgTable, serial, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  prediction: text("prediction").notNull(),
  confidence: real("confidence").notNull(),
  explanation: text("explanation").notNull(),
  mediaType: text("media_type").notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size"),
  analysisDetails: jsonb("analysis_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
