# Zod Implementation Guide

## What is Zod?

**Zod** is a TypeScript-first schema validation library that allows you to:
- Define the structure and validation rules for your data
- Validate data at runtime (when the app is running)
- Generate TypeScript types automatically from schemas
- Provide detailed error messages for invalid data

### Why Use Zod?

```
Traditional Approach (No Validation):
User submits form → Data sent to database → Database errors or bad data stored

With Zod:
User submits form → Zod validates → If valid: proceed | If invalid: show errors
```

---

## How Zod is Used in This App

This app uses **Drizzle-Zod**, which creates Zod schemas automatically from your database schema (Drizzle ORM).

### The Flow

```
Database Schema (Drizzle)
        ↓
   Drizzle-Zod
        ↓
   Zod Schemas (validation rules)
        ↓
   TypeScript Types
        ↓
   React Hook Form (with validation)
        ↓
   User sees errors in real-time
```

---

## File Structure

```
📁 repairshop/
   ├── 📁 db/
   │   └── 📄 schema.ts              (Database schema - source of truth)
   │
   ├── 📁 zod-schema/
   │   ├── 📄 customer.ts            (Customer validation schemas)
   │   └── 📄 ticket.ts              (Ticket validation schemas)
   │
   └── 📁 app/(rs)/customers/form/
       └── 📄 CustomerForm.tsx       (Uses schemas for validation)
```

---

## Step-by-Step: How It Works

### 1. Database Schema (Source of Truth)

```tsx path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/schema.ts start=12
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone").notNull(),
  address1: varchar("address1").notNull(),
  address2: varchar("address2"),
  city: varchar("city").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**This defines:**
- What columns exist in the database
- What data types they are
- Which fields are required (`.notNull()`)
- Length constraints (e.g., state must be 2 characters)

---

### 2. Creating Zod Schemas from Database Schema

```tsx path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/zod-schema/customer.ts start=5
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
```

**Breaking it down:**

#### `createInsertSchema(customers, {...})`
- **First parameter**: `customers` - the database table schema
- **Second parameter**: Custom validation rules to add on top of database rules

#### Custom Validation Rules

Each field can have additional validation:

| Field | Validation | Error Message |
|-------|------------|---------------|
| `firstName` | Must be at least 1 character | "First name is required" |
| `lastName` | Must be at least 1 character | "Last name is required" |
| `email` | Must be valid email format | "Invalid email address" |
| `zipCode` | Must match pattern: 12345 or 12345-6789 | Custom zip code message |
| `phone` | Must match pattern: 123-456-7890 | Custom phone message |
| `state` | Must be exactly 2 characters | "State must be 2 characters" |

---

### 3. Creating TypeScript Types

```tsx path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/zod-schema/customer.ts start=24
export const selectCustomerSchema = createSelectSchema(customers);

export type insertCustomerSchemaType = typeof insertCustomerSchema._type;

export type selectCustomerSchemaType = typeof selectCustomerSchema._type;
```

**Two schemas created:**

#### `insertCustomerSchema`
- Used when **creating or updating** a customer
- Has strict validation rules
- Used with forms

#### `selectCustomerSchema`
- Used when **reading** customer data from database
- Less strict (reflects what's actually in DB)
- Used with queries

**Two TypeScript types exported:**
- `insertCustomerSchemaType` - for form data
- `selectCustomerSchemaType` - for fetched data

---

### 4. Using Zod with React Hook Form

```tsx path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/app/(rs)/customers/form/CustomerForm.tsx start=3
import React, { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertCustomerSchema,
  type insertCustomerSchemaType,
} from "@/zod-schema/customer";

// ...

const form = useForm<insertCustomerSchemaType>({
  mode: "onBlur",
  resolver: zodResolver(insertCustomerSchema),
  defaultValues,
});
```

**What's happening:**

1. **Import zodResolver** - Connects Zod with React Hook Form
2. **Import schema and type** - Brings in validation rules
3. **Configure useForm**:
   - `mode: "onBlur"` - Validate when user leaves a field
   - `resolver: zodResolver(insertCustomerSchema)` - Use Zod for validation
   - `defaultValues` - Initial form values

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTS WITH FORM                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  User types in field  │
                  │  (e.g., email input)  │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  User leaves field    │
                  │  (onBlur triggered)   │
                  └───────────┬───────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │       React Hook Form detects change      │
        │       Calls zodResolver                   │
        └───────────────────┬───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │    zodResolver(insertCustomerSchema)      │
        │    Validates field against Zod schema     │
        └───────────────────┬───────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    ┌─────────────┐               ┌─────────────────┐
    │  Valid ✓    │               │  Invalid ✗      │
    └──────┬──────┘               └────────┬────────┘
           │                                │
           │                                ▼
           │                  ┌───────────────────────────┐
           │                  │  Zod returns error object │
           │                  │  {                        │
           │                  │    email: {               │
           │                  │      message: "Invalid    │
           │                  │                email"     │
           │                  │    }                      │
           │                  │  }                        │
           │                  └────────┬──────────────────┘
           │                           │
           │                           ▼
           │            ┌─────────────────────────────────┐
           │            │  React Hook Form stores error   │
           │            └──────────┬──────────────────────┘
           │                       │
           │                       ▼
           │            ┌─────────────────────────────────┐
           │            │  Error message displayed        │
           │            │  in UI (red text below field)   │
           │            └─────────────────────────────────┘
           │
           ▼
  ┌────────────────────┐
  │  No error shown    │
  │  Field is valid    │
  └────────────────────┘
           │
           │ (All fields valid)
           ▼
  ┌────────────────────────┐
  │  Submit button enabled │
  └────────┬───────────────┘
           │
           ▼
  ┌────────────────────────┐
  │  User clicks Submit    │
  └────────┬───────────────┘
           │
           ▼
  ┌─────────────────────────────────┐
  │  Final validation runs on       │
  │  all fields simultaneously      │
  └────────┬────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────┐
  │  If valid: submitForm() called  │
  │  If invalid: Show all errors    │
  └─────────────────────────────────┘
```

---

## Validation Examples

### Example 1: Email Validation

```tsx
// Zod Schema
email: (schema) => schema.email("Invalid email address")

// What happens:
User types: "john@example"       → Invalid ✗ "Invalid email address"
User types: "john@example.com"   → Valid ✓
User types: "notanemail"         → Invalid ✗ "Invalid email address"
```

### Example 2: Phone Validation

```tsx
// Zod Schema
phone: (schema) =>
  schema.regex(
    /^\d{3}-\d{3}-\d{4}$/,
    "Invalid phone number. Use format: 123-456-7890",
  )

// What happens:
User types: "1234567890"     → Invalid ✗ "Use format: 123-456-7890"
User types: "123-456-7890"   → Valid ✓
User types: "(123) 456-7890" → Invalid ✗ "Use format: 123-456-7890"
```

### Example 3: Zip Code Validation

```tsx
// Zod Schema
zipCode: (schema) =>
  schema.regex(
    /^\d{5}(-\d{4})?$/,
    "Invalid zip code. Use 5 digits or 5 digits followed by a hyphen and 4 digits",
  )

// What happens:
User types: "12345"       → Valid ✓
User types: "12345-6789"  → Valid ✓
User types: "1234"        → Invalid ✗ (message shown)
User types: "12345-678"   → Invalid ✗ (message shown)
```

### Example 4: State Validation

```tsx
// Zod Schema
state: (schema) => schema.length(2, "State must be 2 characters")

// What happens:
User types: "CA"    → Valid ✓
User types: "C"     → Invalid ✗ "State must be 2 characters"
User types: "CAL"   → Invalid ✗ "State must be 2 characters"
```

---

## Regex Patterns Explained

### Phone Number Pattern: `/^\d{3}-\d{3}-\d{4}$/`

```
^          → Start of string
\d{3}      → Exactly 3 digits
-          → Literal hyphen
\d{3}      → Exactly 3 digits
-          → Literal hyphen
\d{4}      → Exactly 4 digits
$          → End of string

Matches: 123-456-7890
Doesn't match: 1234567890, (123) 456-7890
```

### Zip Code Pattern: `/^\d{5}(-\d{4})?$/`

```
^          → Start of string
\d{5}      → Exactly 5 digits
(-\d{4})?  → Optional group: hyphen followed by 4 digits
$          → End of string

Matches: 12345, 12345-6789
Doesn't match: 1234, 12345-678, 123456
```

---

## Integration with React Hook Form

### Why zodResolver?

React Hook Form needs a way to validate data. The `zodResolver` acts as a bridge:

```
React Hook Form ←→ zodResolver ←→ Zod Schema
```

**Without zodResolver:**
- You'd have to write validation functions manually
- Error messages would be inconsistent
- No automatic TypeScript types

**With zodResolver:**
- Automatic validation based on schema
- Consistent error messages
- Type safety throughout the form

---

## Benefits in This App

### 1. Single Source of Truth
```
Database Schema → Zod Schema → TypeScript Types → Form Validation

Change database schema → Everything updates automatically
```

### 2. Type Safety
```tsx
// TypeScript knows exactly what fields exist
const form = useForm<insertCustomerSchemaType>({
  defaultValues: {
    firstName: "",  // ✓ TypeScript knows this field exists
    lastName: "",   // ✓ TypeScript knows this field exists
    age: 0,         // ✗ TypeScript error - field doesn't exist
  }
});
```

### 3. Runtime Validation
```tsx
// Even if TypeScript types are bypassed, Zod catches errors at runtime
form.submit({
  email: "invalid-email"  // Zod will catch this and show error
});
```

### 4. Better User Experience
```
Without Zod:
User submits form → Server error → User confused

With Zod:
User types invalid email → Instant feedback → User corrects → Smooth experience
```

---

## Advanced: Creating Custom Validators

You can create reusable validation rules:

```tsx
// Custom validator for phone numbers
const phoneValidator = z.string().regex(
  /^\d{3}-\d{3}-\d{4}$/,
  "Invalid phone number format"
);

// Custom validator for US states
const stateValidator = z.string().length(2).toUpperCase();

// Use in schema
export const insertCustomerSchema = createInsertSchema(customers, {
  phone: phoneValidator,
  state: stateValidator,
});
```

---

## Common Zod Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `.min(n)` | Minimum length/value | `schema.min(1, "Required")` |
| `.max(n)` | Maximum length/value | `schema.max(100, "Too long")` |
| `.length(n)` | Exact length | `schema.length(2, "Must be 2 chars")` |
| `.email()` | Valid email format | `schema.email("Invalid email")` |
| `.regex(pattern)` | Match regex pattern | `schema.regex(/^\d+$/, "Numbers only")` |
| `.optional()` | Field is optional | `schema.optional()` |
| `.nullable()` | Field can be null | `schema.nullable()` |
| `.default(value)` | Default value | `schema.default("")` |

---

## Debugging Tips

### View Validation Errors

```tsx
// In your component
console.log(form.formState.errors);

// Output:
{
  email: { message: "Invalid email address" },
  phone: { message: "Invalid phone number. Use format: 123-456-7890" }
}
```

### Test Schema Independently

```tsx
import { insertCustomerSchema } from "@/zod-schema/customer";

// Test data
const testData = {
  firstName: "John",
  email: "invalid-email",
};

// Validate
const result = insertCustomerSchema.safeParse(testData);

if (!result.success) {
  console.log(result.error.errors);
}
```

---

## Summary

**Zod in this app provides:**
1. ✅ Automatic schema generation from database
2. ✅ Runtime validation to prevent bad data
3. ✅ TypeScript types for compile-time safety
4. ✅ User-friendly error messages
5. ✅ Integration with React Hook Form
6. ✅ Consistent validation across the app

**The flow:**
```
Database Schema (Drizzle)
    ↓
Zod Schema (with custom rules)
    ↓
TypeScript Types
    ↓
React Hook Form (with zodResolver)
    ↓
Real-time validation for users
```
