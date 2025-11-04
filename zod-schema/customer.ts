import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { customers } from "@/db/schema";
import { z } from "zod";

export const insertCustomerSchema = createInsertSchema(customers, {
  firstName: (schema) => schema.min(1, "First name is required"),
  lastName: (schema) => schema.min(1, "Last name is required"),
  address1: (schema) => schema.min(1, "Address is required"),
  city: (schema) => schema.min(1, "City is required"),
  state: (schema) => schema.length(2, "State must be 2 characters"),
  email: (schema) => schema.email("Invalid email address"),
  zipCode: (schema) =>
    schema.regex(
      /^\d{5}(-\d{4})?$/,
      "Invalid zip code. Use 5 digits or 5 digits followed by a hyphen and 4 digits",
    ),
  phone: (schema) =>
    schema.regex(
      /^\d{3}-\d{3}-\d{4}$/,
      "Invalid phone number. Use format: 123-456-7890",
    ),
});

export const selectCustomerSchema = createSelectSchema(customers);

export type insertCustomerSchemaType = z.infer<typeof insertCustomerSchema>;

export type selectCustomerSchemaType = z.infer<typeof selectCustomerSchema>;
