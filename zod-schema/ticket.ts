import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { tickets } from "@/db/schema";
import { z } from "zod";

export const insertTicketSchema = createInsertSchema(tickets, {
  id: z.union([z.number(), z.literal("(New)")]),
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  tech: (schema) => schema.min(1, "Tech is required"),
});

export const selectTicketSchema = createSelectSchema(tickets);

export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type SelectTicket = z.infer<typeof selectTicketSchema>;
