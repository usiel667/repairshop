# Drizzle ORM + Neon PostgreSQL Setup Guide

## Overview

This guide explains how Drizzle ORM is integrated with Neon PostgreSQL database in your repairshop Next.js application.

---

## 📦 Dependencies

```json path=null start=null
{
  "dependencies": {
    "@neondatabase/serverless": "^1.0.2",
    "drizzle-orm": "^0.44.6"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.5",
    "tsx": "^4.20.6",
    "dotenv": "^17.2.3"
  }
}
```

- **@neondatabase/serverless**: Neon's serverless driver for PostgreSQL
- **drizzle-orm**: TypeScript ORM for SQL databases
- **drizzle-kit**: CLI companion for generating migrations and managing schemas
- **tsx**: TypeScript executor for running migration scripts

---

## 🗂️ Project Structure

```
repairshop/
├── db/
│   ├── schema.ts          # Database schema definitions
│   ├── index.ts           # Database connection setup
│   ├── migrate.ts         # Migration runner script
│   └── migrations/        # Generated migration files
├── drizzle.config.ts      # Drizzle Kit configuration
└── .env.local             # Environment variables (DATABASE_URL)
```

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Application                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Application Code                       │ │
│  │              (Server Components, API Routes)               │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
│                            │                                    │
│                            ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   db/index.ts (db client)                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  drizzle(sql) - ORM Instance                         │  │ │
│  │  │  - Type-safe query builder                           │  │ │
│  │  │  - Schema awareness                                  │  │ │
│  │  └──────────────────┬───────────────────────────────────┘  │ │
│  └─────────────────────┼──────────────────────────────────────┘ │
│                        │                                        │
│                        ↓                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              @neondatabase/serverless (sql)                │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  neon(DATABASE_URL) - HTTP Connection                │  │ │
│  │  │  - Serverless-optimized                              │  │ │
│  │  │  - Edge runtime compatible                           │  │ │
│  │  └──────────────────┬───────────────────────────────────┘  │ │
│  └─────────────────────┼──────────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ↓
        ┌────────────────────────────────┐
        │      Neon PostgreSQL Cloud     │
        │                                │
        │  ┌────────────────────────────┐│
        │  │    PostgreSQL Database     ││
        │  │  ┌──────────────────────┐  ││
        │  │  │  customers table     │  ││
        │  │  │  tickets table       │  ││
        │  │  └──────────────────────┘  ││
        │  └────────────────────────────┘│
        └────────────────────────────────┘
```

---

## 🔧 Configuration Breakdown

### 1. Environment Variables (`.env.local`)

```bash path=null start=null
DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/database?sslmode=require
```

This URL contains:
- **Username/Password**: Authentication credentials
- **Host**: Neon serverless endpoint
- **Database**: Your database name
- **SSL Mode**: Required for secure connections

---

### 2. Drizzle Config (`drizzle.config.ts`)

```typescript path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/drizzle.config.ts start=1
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Purpose**: Configure Drizzle Kit CLI for:
- **schema**: Where to find TypeScript schema definitions
- **out**: Where to output generated SQL migrations
- **dialect**: SQL dialect (PostgreSQL in this case)
- **dbCredentials**: Connection string to database

---

### 3. Database Schema (`db/schema.ts`)

```typescript path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/schema.ts start=1
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  title: varchar("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  tech: varchar("tech").notNull().default("unassigned"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Create relations
export const customerRelations = relations(customers, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
}));
```

**Purpose**: Define database structure in TypeScript
- **Type-safe**: Full TypeScript inference
- **Tables**: `customers` and `tickets`
- **Relations**: One-to-many (customer → tickets)
- **Constraints**: Primary keys, foreign keys, unique constraints
- **Defaults**: Auto-generated timestamps, default values

---

### 4. Database Connection (`db/index.ts`)

```typescript path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/index.ts start=1
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

// logger
// const db = drizzle(sql, { logger: true });
//
const db = drizzle(sql);

export { db };
```

**Purpose**: Create reusable database client
- **neon()**: Creates HTTP connection to Neon
- **drizzle()**: Wraps connection with ORM functionality
- **Export**: Single `db` instance used throughout app
- **Logger**: Can be enabled for debugging queries

---

### 5. Migration Runner (`db/migrate.ts`)

```typescript path=/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/migrate.ts start=1
import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/migrations",
    });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Error applying migrations:", error);
    process.exit(1);
  }
};

main();
```

**Purpose**: Apply SQL migrations to database
- **migrate()**: Reads and executes migration files
- **migrationsFolder**: Points to generated migrations
- **Error handling**: Exits with code 1 on failure

---

## 🚀 Workflow: From Schema to Database

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEVELOPMENT WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

Step 1: Define Schema
┌────────────────────────────────┐
│  Edit db/schema.ts             │
│  - Add/modify tables           │
│  - Define columns              │
│  - Set up relations            │
└────────────────┬───────────────┘
                 │
                 ↓
Step 2: Generate Migration
┌────────────────────────────────┐
│  npm run db:generate           │
│                                │
│  drizzle-kit generate          │
│  - Reads schema.ts             │
│  - Compares with DB state      │
│  - Creates SQL migration file  │
│  - Saves to db/migrations/     │
└────────────────┬───────────────┘
                 │
                 ↓
Step 3: Apply Migration
┌────────────────────────────────┐
│  npm run db:migrate            │
│                                │
│  tsx ./db/migrate.ts           │
│  - Runs migrate.ts script      │
│  - Connects to Neon            │
│  - Executes SQL migrations     │
│  - Updates DB schema           │
└────────────────┬───────────────┘
                 │
                 ↓
Step 4: Use in Application
┌────────────────────────────────┐
│  import { db } from "@/db"     │
│                                │
│  const result = await db       │
│    .select()                   │
│    .from(customers)            │
│    .where(eq(...))             │
└────────────────────────────────┘
```

---

## 📝 NPM Scripts

### `npm run db:generate`
```bash path=null start=null
drizzle-kit generate
```
- Analyzes `db/schema.ts`
- Generates SQL migration files in `db/migrations/`
- Creates timestamped migration files

### `npm run db:migrate`
```bash path=null start=null
tsx ./db/migrate.ts
```
- Executes the `migrate.ts` script
- Applies pending migrations to Neon database
- Idempotent (safe to run multiple times)

---

## 🔗 How Components Connect

### Flow: Application Query → Database

```
1. Application Code
   ↓
   import { db } from "@/db";
   ↓
2. db instance (from db/index.ts)
   ↓
   Uses drizzle(sql) with neon connection
   ↓
3. Drizzle ORM
   ↓
   Builds type-safe SQL query
   ↓
4. @neondatabase/serverless
   ↓
   Sends HTTP request to Neon
   ↓
5. Neon PostgreSQL
   ↓
   Executes query and returns results
   ↓
6. Results flow back through the stack
   ↓
   Typed data arrives in application
```

---

## 🔍 Example Queries

### Insert a Customer
```typescript path=null start=null
import { db } from "@/db";
import { customers } from "@/db/schema";

const newCustomer = await db.insert(customers).values({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  address1: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
}).returning();
```

### Query with Relations
```typescript path=null start=null
import { db } from "@/db";
import { customers, tickets } from "@/db/schema";
import { eq } from "drizzle-orm";

const customerWithTickets = await db.query.customers.findFirst({
  where: eq(customers.id, 1),
  with: {
    tickets: true,
  },
});
```

### Update a Ticket
```typescript path=null start=null
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq } from "drizzle-orm";

await db.update(tickets)
  .set({ completed: true, tech: "Alice" })
  .where(eq(tickets.id, 5));
```

---

## ✨ Key Benefits

### 1. **Type Safety**
- Full TypeScript inference from schema to queries
- Compile-time error checking
- Auto-completion in IDE

### 2. **Serverless Optimized**
- Neon uses HTTP connections (not TCP)
- Works in edge environments (Vercel Edge, Cloudflare Workers)
- No connection pooling needed

### 3. **Migration Management**
- Version-controlled schema changes
- Automatic SQL generation
- Safe, incremental updates

### 4. **Developer Experience**
- SQL-like syntax
- Relational queries
- No need to write raw SQL

---

## 🛠️ Common Commands

```bash path=null start=null
# Start development server
npm run dev

# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (visual database browser)
npx drizzle-kit studio
```

---

## 🌐 Connection Flow Detail

### Neon HTTP vs Traditional TCP

**Traditional PostgreSQL (TCP)**
```
App → TCP Connection Pool → PostgreSQL Server
      (long-lived connections)
```

**Neon Serverless (HTTP)**
```
App → HTTP Request → Neon Proxy → PostgreSQL
      (stateless, instant)
```

Benefits:
- ✅ No cold start delays
- ✅ Works in serverless/edge environments
- ✅ Automatic connection management
- ✅ Built-in connection pooling

---

## 📊 Database Schema Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                           | 
├─────────────────────────────────────────────────────────────┤
│ id (PK)              serial                                 │
│ first_name           varchar                                │
│ last_name            varchar                                │
│ email                varchar (unique)                       │
│ phone                varchar                                │
│ address1             varchar                                │
│ address2             varchar (nullable)                     │
│ city                 varchar                                │
│ state                varchar(2)                             │
│ zip_code             varchar(10)                            │
│ notes                text (nullable)                        │
│ active               boolean (default: true)                │
│ created_at           timestamp (default: now())             │
│ updated_at           timestamp (auto-update)                │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ 1:N
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                          TICKETS                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)              serial                                 │
│ customer_id (FK)     integer → customers.id                 │
│ title                varchar                                │
│ description          text (nullable)                        │
│ completed            boolean (default: false)               │
│ tech                 varchar (default: 'unassigned')        │
│ created_at           timestamp (default: now())             │
│ updated_at           timestamp (auto-update)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

Your repairshop uses:
1. **Neon** for serverless PostgreSQL hosting
2. **Drizzle ORM** for type-safe database queries
3. **Drizzle Kit** for migration generation
4. **TypeScript schemas** as the single source of truth

The setup is optimized for Next.js serverless/edge deployment and provides full type safety from database to application layer.
