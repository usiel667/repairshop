# Repairshop Reference Guide

## Overview
The Repairshop application is a modern Next.js 15 web application designed for managing a computer repair shop's operations. It provides customer management, ticket tracking, and authentication features with a clean, responsive interface.

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Kinde Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Validation**: Zod schemas
- **Error Monitoring**: Sentry
- **Deployment**: Turbopack for development

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            REPAIRSHOP SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Browser   │    │   Mobile    │    │   Tablet    │                 │
│  │   Client    │    │   Client    │    │   Client    │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                        │
│         └──────────────────┼──────────────────┘                        │
│                            │                                           │
│  ┌─────────────────────────┼─────────────────────────┐                 │
│  │             NEXT.JS APPLICATION                   │                 │
│  │                         │                         │                 │
│  │  ┌─────────────────────┬┴┬────────────────────────┴─┐               │
│  │  │     MIDDLEWARE      │ │       APP ROUTER          │               │
│  │  │   (Authentication)  │ │                           │               │
│  │  │                     │ │  ┌─────────┐ ┌─────────┐  │               │
│  │  │  ┌─────────────────┐│ │  │ Public  │ │Protected│  │               │
│  │  │  │ Kinde Auth      ││ │  │ Routes  │ │ Routes  │  │               │
│  │  │  │ Middleware      ││ │  │         │ │  (rs)   │  │               │
│  │  │  │                 ││ │  └─────────┘ └─────────┘  │               │
│  │  │  └─────────────────┘│ │                           │               │
│  │  └─────────────────────┼─┼───────────────────────────┘               │
│  │                        │ │                                           │
│  │  ┌─────────────────────┼─┼───────────────────────────┐               │
│  │  │       COMPONENTS    │ │                           │               │
│  │  │                     │ │  ┌─────────┐ ┌─────────┐  │               │
│  │  │  ┌─────────┐       │ │  │  Header │ │Navigation│  │               │
│  │  │  │UI Layer │       │ │  └─────────┘ └─────────┘  │               │
│  │  │  │(shadcn) │       │ │  ┌─────────┐ ┌─────────┐  │               │
│  │  │  └─────────┘       │ │  │  Forms  │ │ Inputs  │  │               │
│  │  │                     │ │  └─────────┘ └─────────┘  │               │
│  │  └─────────────────────┼─┼───────────────────────────┘               │
│  │                        │ │                                           │
│  │  ┌─────────────────────┼─┼───────────────────────────┐               │
│  │  │    BUSINESS LOGIC   │ │                           │               │
│  │  │                     │ │  ┌─────────┐ ┌─────────┐  │               │
│  │  │  ┌─────────────────┐│ │  │ Queries │ │Validation│  │               │
│  │  │  │ Zod Validation  ││ │  │ Layer   │ │Schemas  │  │               │
│  │  │  │ Schemas         ││ │  └─────────┘ └─────────┘  │               │
│  │  │  └─────────────────┘│ │                           │               │
│  │  └─────────────────────┼─┼───────────────────────────┘               │
│  │                        │ │                                           │
│  │  ┌─────────────────────┼─┼───────────────────────────┐               │
│  │  │     DATA LAYER      │ │                           │               │
│  │  │                     │ │  ┌─────────┐ ┌─────────┐  │               │
│  │  │  ┌─────────────────┐│ │  │ Drizzle │ │Database │  │               │
│  │  │  │ Drizzle ORM     ││ │  │   ORM   │ │Queries  │  │               │
│  │  │  │ Configuration   ││ │  └─────────┘ └─────────┘  │               │
│  │  │  └─────────────────┘│ │                           │               │
│  │  └─────────────────────┼─┼───────────────────────────┘               │
│  └──────────────────────────┼─────────────────────────────────────────────┘
│                            │                                           │
│  ┌─────────────────────────┼─────────────────────────────┐               │
│  │        EXTERNAL SERVICES                              │               │
│  │                         │                             │               │
│  │  ┌─────────────┐   ┌───┴────────┐   ┌─────────────┐  │               │
│  │  │    Kinde    │   │    Neon    │   │   Sentry    │  │               │
│  │  │    Auth     │   │ PostgreSQL │   │  Monitoring │  │               │
│  │  │  Service    │   │  Database  │   │   Service   │  │               │
│  │  └─────────────┘   └────────────┘   └─────────────┘  │               │
│  └─────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Model & Relationships

### Database Schema
The application uses PostgreSQL with Drizzle ORM for type-safe database operations.

#### Customers Table
```sql
customers (
  id: SERIAL PRIMARY KEY,
  first_name: VARCHAR NOT NULL,
  last_name: VARCHAR NOT NULL,
  email: VARCHAR UNIQUE NOT NULL,
  phone: VARCHAR NOT NULL,
  address1: VARCHAR NOT NULL,
  address2: VARCHAR,
  city: VARCHAR NOT NULL,
  state: VARCHAR(2) NOT NULL,
  zip_code: VARCHAR(10) NOT NULL,
  notes: TEXT,
  active: BOOLEAN DEFAULT TRUE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

#### Tickets Table
```sql
tickets (
  id: SERIAL PRIMARY KEY,
  customer_id: INTEGER REFERENCES customers(id),
  title: VARCHAR NOT NULL,
  description: TEXT,
  completed: BOOLEAN DEFAULT FALSE,
  tech: VARCHAR DEFAULT 'unassigned',
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### Entity Relationship Diagram
```
┌─────────────────────────┐         ┌─────────────────────────┐
│       CUSTOMERS         │         │         TICKETS         │
├─────────────────────────┤         ├─────────────────────────┤
│ id (PK)                 │◄───────┐│ id (PK)                 │
│ first_name              │        ││ customer_id (FK)        │
│ last_name               │        ││ title                   │
│ email (UNIQUE)          │        ││ description             │
│ phone                   │        ││ completed               │
│ address1                │        ││ tech                    │
│ address2                │        ││ created_at              │
│ city                    │        ││ updated_at              │
│ state                   │        │└─────────────────────────┘
│ zip_code                │        │
│ notes                   │        │
│ active                  │        │ Relationship: One-to-Many
│ created_at              │        │ (One Customer → Many Tickets)
│ updated_at              │        │
└─────────────────────────┘        │
                                   │
        1                          │ *
        │                          │
        └──────────────────────────┘
```

## Application Flow & User Journey

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │   Landing   │    │    Kinde    │    │  Protected  │
│   Access    │───►│    Page     │───►│    Auth     │───►│   Routes    │
│             │    │ (Homepage)  │    │  Service    │    │    (rs)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                  ┌─────────────┐
                  │  Login Page │
                  │  Component  │
                  └─────────────┘

Authentication States:
┌──────────────────────────────────────────────────────────────────────┐
│  UNAUTHENTICATED                    AUTHENTICATED                    │
│                                                                      │
│  ┌─────────────┐                   ┌─────────────┐                  │
│  │ Landing     │                   │ Header      │                  │
│  │ Page        │                   │ Component   │                  │
│  │             │                   │             │                  │
│  │ ┌─────────┐ │                   │ ┌─────────┐ │                  │
│  │ │ Sign In │ │                   │ │ Logout  │ │                  │
│  │ │ Button  │ │    ──────────►    │ │ Button  │ │                  │
│  │ └─────────┘ │                   │ └─────────┘ │                  │
│  │             │                   │             │                  │
│  └─────────────┘                   └─────────────┘                  │
│                                                                      │
│  ┌─────────────┐                   ┌─────────────┐                  │
│  │ Login Page  │                   │ Home Page   │                  │
│  │ (/login)    │                   │ (/home)     │                  │
│  └─────────────┘                   └─────────────┘                  │
│                                                                      │
│  Access Denied to:                  Full Access to:                 │
│  • /home                           • /home                          │
│  • /customers                      • /customers                     │
│  • /tickets                        • /tickets                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Application Navigation Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION ROUTES                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PUBLIC ROUTES                    PROTECTED ROUTES (rs)                 │
│  ┌─────────────┐                 ┌─────────────────────────────────┐    │
│  │      /      │                 │             /(rs)               │    │
│  │ (Homepage)  │                 │                                 │    │
│  └─────────────┘                 │  ┌─────────┐  ┌─────────────┐  │    │
│                                  │  │  /home  │  │ /customers  │  │    │
│  ┌─────────────┐                 │  │  Page   │  │    Page     │  │    │
│  │   /login    │                 │  └─────────┘  └─────────────┘  │    │
│  │    Page     │                 │                                 │    │
│  └─────────────┘                 │  ┌─────────────┐               │    │
│                                  │  │  /tickets   │               │    │
│  ┌─────────────┐                 │  │    Page     │               │    │
│  │ /not-found  │                 │  └─────────────┘               │    │
│  │    Page     │                 │                                 │    │
│  └─────────────┘                 └─────────────────────────────────┘    │
│                                                                         │
│  API ROUTES                      ERROR HANDLING                         │
│  ┌─────────────┐                 ┌─────────────────────────────────┐    │
│  │/api/sentry- │                 │ ┌─────────┐  ┌─────────────┐    │    │
│  │example-api  │                 │ │ error.  │  │global-error.│    │    │
│  └─────────────┘                 │ │  tsx    │  │    tsx      │    │    │
│                                  │ └─────────┘  └─────────────┘    │    │
│                                  └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Component Hierarchy
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT TREE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RootLayout (app/layout.tsx)                                            │
│  ├─ ThemeProvider                                                       │
│  │   ├─ Homepage (/)                                                    │
│  │   ├─ LoginPage (/login)                                              │
│  │   └─ RSLayout (/(rs)/layout.tsx)                                     │
│  │       ├─ Header                                                      │
│  │       │   ├─ NavButton (Home)                                        │
│  │       │   ├─ NavButton (Tickets)                                     │
│  │       │   ├─ NavButton (Customers)                                   │
│  │       │   ├─ ModeToggle                                              │
│  │       │   └─ LogoutLink                                              │
│  │       ├─ HomePage (/(rs)/home)                                       │
│  │       ├─ CustomersPage (/(rs)/customers)                             │
│  │       └─ TicketsPage (/(rs)/tickets)                                 │
│  │                                                                      │
│  └─ Global Components                                                   │
│      ├─ UI Components (shadcn/ui)                                       │
│      │   ├─ Button                                                      │
│      │   ├─ Form                                                        │
│      │   ├─ Input                                                       │
│      │   ├─ Select                                                      │
│      │   ├─ Textarea                                                    │
│      │   ├─ Checkbox                                                    │
│      │   ├─ Label                                                       │
│      │   └─ DropdownMenu                                               │
│      │                                                                  │
│      └─ Custom Input Components                                         │
│          ├─ InputWithLabel                                              │
│          ├─ SelectWithLabel                                             │
│          ├─ TextAreaWithLabel                                           │
│          └─ CheckboxWithLabel                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Theme & Styling Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          THEME SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   ThemeProvider │    │   ModeToggle    │    │  Tailwind CSS   │      │
│  │   (next-themes) │───►│   Component     │───►│   Variables     │      │
│  │                 │    │                 │    │                 │      │
│  │ • Light Theme   │    │ • Light Mode    │    │ • CSS Custom    │      │
│  │ • Dark Theme    │    │ • Dark Mode     │    │   Properties    │      │
│  │ • System Theme  │    │ • System Mode   │    │ • Color Tokens  │      │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘      │
│                                                                         │
│  Theme States:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  LIGHT MODE         │  DARK MODE         │  SYSTEM MODE        │    │
│  │  ┌─────────────┐    │  ┌─────────────┐   │  ┌─────────────┐    │    │
│  │  │ bg-white    │    │  │ bg-gray-900 │   │  │ Follows OS  │    │    │
│  │  │ text-black  │    │  │ text-white  │   │  │ Preference  │    │    │
│  │  │ border-gray │    │  │ border-gray │   │  │             │    │    │
│  │  └─────────────┘    │  └─────────────┘   │  └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Database Operations Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CLIENT REQUEST                                                         │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Next.js   │───►│  Page/API   │───►│ Server      │                 │
│  │ Router/API  │    │ Component   │    │ Component   │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                                      │                       │
│         ▼                                      ▼                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Middleware  │    │   Query     │    │    Zod      │                 │
│  │ (Auth       │    │ Functions   │    │ Validation  │                 │
│  │ Check)      │    │ lib/queries │    │ Schemas     │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Kinde Auth  │    │  Drizzle    │    │  Database   │                 │
│  │ Validation  │    │    ORM      │    │  (Neon      │                 │
│  │             │    │             │    │ PostgreSQL) │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         │                     └─────────────────┘                      │
│         │                              │                               │
│         ▼                              ▼                               │
│  ┌─────────────┐              ┌─────────────┐                          │
│  │ Redirect/   │              │ Return Data │                          │
│  │ Deny Access │              │ to Client   │                          │
│  └─────────────┘              └─────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Form Validation Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  USER INPUT                                                             │
│       │                                                                 │
│       ▼                                                                 │
│ ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│ │   Client    │───►│ React Hook  │───►│   Zod       │                  │
│ │   Form      │    │   Form      │    │ Schema      │                  │
│ │  Component  │    │ Validation  │    │ Validation  │                  │
│ └─────────────┘    └─────────────┘    └─────────────┘                  │
│       │                    │                  │                        │
│       ▼                    ▼                  ▼                        │
│ ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│ │ Field-level │    │ Form-level  │    │ Type-safe   │                  │
│ │ Validation  │    │ Validation  │    │ Data        │                  │
│ │ (Real-time) │    │ (Submit)    │    │ Output      │                  │
│ └─────────────┘    └─────────────┘    └─────────────┘                  │
│       │                    │                  │                        │
│       ▼                    ▼                  ▼                        │
│ ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│ │ Error       │    │ Submit      │    │ Database    │                  │
│ │ Display     │    │ Prevention  │    │ Insert/     │                  │
│ │ (UI)        │    │ (Invalid)   │    │ Update      │                  │
│ └─────────────┘    └─────────────┘    └─────────────┘                  │
│                                                                         │
│  Validation Rules Applied:                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ CUSTOMER SCHEMA              │  TICKET SCHEMA                   │    │
│  │ • firstName: min 1 char      │  • title: min 1 char            │    │
│  │ • lastName: min 1 char       │  • description: min 1 char      │    │
│  │ • email: valid email format  │  • tech: min 1 char             │    │
│  │ • phone: XXX-XXX-XXXX format │  • customerId: valid reference   │    │
│  │ • zipCode: XXXXX or XXXXX-XX │                                  │    │
│  │ • state: exactly 2 chars     │                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Environment Variables & Configuration

### System Variables Reference
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENVIRONMENT VARIABLES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DATABASE CONFIGURATION                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ DATABASE_URL                                                    │    │
│  │ • Type: PostgreSQL connection string                           │    │
│  │ • Provider: Neon Database                                      │    │
│  │ • Usage: Drizzle ORM connection                                │    │
│  │ • Format: postgresql://user:pass@host:port/db?sslmode=require  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  AUTHENTICATION (KINDE)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ KINDE_CLIENT_ID                                                 │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: OAuth client identification                           │    │
│  │                                                                 │    │
│  │ KINDE_CLIENT_SECRET                                             │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: OAuth client authentication                           │    │
│  │                                                                 │    │
│  │ KINDE_ISSUER_URL                                               │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: Kinde auth provider endpoint                          │    │
│  │                                                                 │    │
│  │ KINDE_SITE_URL                                                 │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: Application base URL                                   │    │
│  │                                                                 │    │
│  │ KINDE_POST_LOGOUT_REDIRECT_URL                                 │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: Redirect destination after logout                     │    │
│  │                                                                 │    │
│  │ KINDE_POST_LOGIN_REDIRECT_URL                                  │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: Redirect destination after login                      │    │
│  │                                                                 │    │
│  │ KINDE_MANAGEMENT_CLIENT_ID                                     │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: Kinde Management API access                           │    │
│  │                                                                 │    │
│  │ KINDE_MANAGEMENT_CLIENT_SECRET                                 │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: Kinde Management API authentication                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ERROR MONITORING (SENTRY)                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ SENTRY_DSN                                                      │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: Error reporting endpoint                               │    │
│  │                                                                 │    │
│  │ SENTRY_AUTH_TOKEN                                               │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: Source map upload authentication                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  NEXT.JS CONFIGURATION                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ NEXTAUTH_URL                                                    │    │
│  │ • Type: URL                                                     │    │
│  │ • Usage: NextAuth base URL (legacy)                            │    │
│  │                                                                 │    │
│  │ NEXTAUTH_SECRET                                                 │    │
│  │ • Type: String                                                  │    │
│  │ • Usage: NextAuth encryption secret (legacy)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Configuration Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION LOADING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  APPLICATION STARTUP                                                    │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   .env.     │───►│ Next.js     │───►│ Component   │                 │
│  │   local     │    │ Runtime     │    │ Access      │                 │
│  │   File      │    │ Loading     │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Environment │    │ process.env │    │ Service     │                 │
│  │ Variables   │    │ Availability│    │ Connections │                 │
│  │ Validation  │    │             │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         └─────────────────────┼─────────────────┘                      │
│                               ▼                                        │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                 ACTIVE CONFIGURATION                          │     │
│  │                                                               │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │     │
│  │  │  Database   │  │    Auth     │  │  Monitoring │           │     │
│  │  │ Connection  │  │ Providers   │  │  Services   │           │     │
│  │  │   (Neon)    │  │  (Kinde)    │  │  (Sentry)   │           │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Security & Authentication

### Authentication System Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Client    │───►│   Next.js   │───►│   Kinde     │                 │
│  │  Request    │    │ Middleware  │    │ Auth Server │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                    │                 │                       │
│         ▼                    ▼                 ▼                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Route       │    │ Auth Check  │    │ User        │                 │
│  │ Protection  │    │ Middleware  │    │ Validation  │                 │
│  │ Rules       │    │             │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  MIDDLEWARE PROTECTION PATTERN:                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ matcher: [                                                      │    │
│  │   "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|    │    │
│  │    images|login|$).*)"                                          │    │
│  │ ]                                                               │    │
│  │                                                                 │    │
│  │ PROTECTED: All routes except:                                   │    │
│  │ • /api routes                                                   │    │
│  │ • Static assets (_next/static, _next/image)                     │    │
│  │ • Public files (favicon.ico, robots.txt)                       │    │
│  │ • Images folder                                                 │    │
│  │ • /login page                                                   │    │
│  │ • Root path (/)                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  AUTHENTICATION STATES:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  UNAUTHORIZED              │            AUTHORIZED               │    │
│  │  ┌─────────────┐           │  ┌─────────────┐ ┌─────────────┐    │    │
│  │  │ Redirect to │           │  │ Access to   │ │ Session     │    │    │
│  │  │ /login      │           │  │ Protected   │ │ Management  │    │    │
│  │  │ Page        │           │  │ Routes      │ │ (Kinde)     │    │    │
│  │  └─────────────┘           │  └─────────────┘ └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Error Handling & Monitoring

### Error Handling Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ERROR TYPES & HANDLERS                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  CLIENT ERRORS              │  SERVER ERRORS                   │    │
│  │  ┌─────────────┐            │  ┌─────────────┐                 │    │
│  │  │ Form        │            │  │ Database    │                 │    │
│  │  │ Validation  │            │  │ Connection  │                 │    │
│  │  │ Errors      │            │  │ Errors      │                 │    │
│  │  └─────────────┘            │  └─────────────┘                 │    │
│  │         │                  │         │                        │    │
│  │         ▼                  │         ▼                        │    │
│  │  ┌─────────────┐            │  ┌─────────────┐                 │    │
│  │  │ Zod Schema  │            │  │ Drizzle ORM │                 │    │
│  │  │ Validation  │            │  │ Error       │                 │    │
│  │  │ Messages    │            │  │ Handling    │                 │    │
│  │  └─────────────┘            │  └─────────────┘                 │    │
│  │         │                  │         │                        │    │
│  │         ▼                  │         ▼                        │    │
│  │  ┌─────────────┐            │  ┌─────────────┐                 │    │
│  │  │ UI Error    │            │  │ Error Page  │                 │    │
│  │  │ Display     │            │  │ (error.tsx) │                 │    │
│  │  └─────────────┘            │  └─────────────┘                 │    │
│  │                            │                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  SENTRY INTEGRATION                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │    │
│  │  │ Client-Side │───►│ Sentry      │───►│ Error       │         │    │
│  │  │ Errors      │    │ Capture     │    │ Dashboard   │         │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │    │
│  │                                                                 │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │    │
│  │  │ Server-Side │───►│ Sentry      │───►│ Performance │         │    │
│  │  │ Errors      │    │ Monitoring  │    │ Monitoring  │         │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │    │
│  │                                                                 │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │    │
│  │  │ API Route   │───►│ Request     │───►│ Source Map  │         │    │
│  │  │ Monitoring  │    │ Monitoring  │    │ Support     │         │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Development & Deployment

### Development Workflow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DEVELOPMENT WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LOCAL DEVELOPMENT                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   npm run   │───►│ Turbopack   │───►│ Hot Module  │                 │
│  │    dev      │    │ Dev Server  │    │ Replacement │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Environment │    │ TypeScript  │    │ Live        │                 │
│  │ Variables   │    │ Compilation │    │ Reloading   │                 │
│  │ Loading     │    │             │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  DATABASE OPERATIONS                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ npm run     │───►│ Drizzle Kit │───►│ Migration   │                 │
│  │ db:generate │    │ Generate    │    │ Files       │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ npm run     │    │ Migration   │    │ Database    │                 │
│  │ db:migrate  │    │ Execution   │    │ Schema      │                 │
│  │             │    │             │    │ Update      │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  CODE QUALITY                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  npm run    │───►│   ESLint    │───►│ Code Style  │                 │
│  │   lint      │    │ Analysis    │    │ Validation  │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Prettier    │    │ TypeScript  │    │ Error       │                 │
│  │ Formatting  │    │ Type Check  │    │ Prevention  │                 │
│  │             │    │             │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Build & Deployment Process
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUILD & DEPLOYMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  BUILD PROCESS                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  npm run    │───►│ Turbopack   │───►│ Optimized   │                 │
│  │   build     │    │ Build       │    │ Bundle      │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                     │                 │                      │
│         ▼                     ▼                 ▼                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ TypeScript  │    │ Tree        │    │ Static      │                 │
│  │ Compilation │    │ Shaking     │    │ Assets      │                 │
│  │             │    │             │    │ Optimization│                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  SENTRY INTEGRATION                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ Source Maps │───►│ Sentry      │───►│ Error       │                 │
│  │ Generation  │    │ Upload      │    │ Tracking    │                 │
│  │             │    │             │    │ Enhanced    │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  DEPLOYMENT TARGETS                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Vercel    │    │   Netlify   │    │   Docker    │                 │
│  │ (Optimal)   │    │ (Alternative│    │ (Custom)    │                 │
│  │             │    │)            │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## API & Integration Points

### External Service Integration
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         KINDE AUTH                              │    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │   OAuth     │  │   Session   │  │ Management  │             │    │
│  │  │ Flow        │  │ Management  │  │ API         │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • Login     │  │ • JWT       │  │ • User      │             │    │
│  │  │ • Logout    │  │ • Refresh   │  │   CRUD      │             │    │
│  │  │ • Register  │  │ • Validate  │  │ • Roles     │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      NEON DATABASE                              │    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │ PostgreSQL  │  │ Connection  │  │ Serverless  │             │    │
│  │  │ Database    │  │ Pooling     │  │ Scaling     │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • ACID      │  │ • SSL       │  │ • Auto      │             │    │
│  │  │   Compliant │  │ • Pooling   │  │   Sleep     │             │    │
│  │  │ • Relational│  │ • Security  │  │ • Instant   │             │    │
│  │  │   Integrity │  │             │  │   Wake      │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     SENTRY MONITORING                           │    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │ Error       │  │ Performance │  │ Release     │             │    │
│  │  │ Tracking    │  │ Monitoring  │  │ Tracking    │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • Exception │  │ • Page Load │  │ • Deploy    │             │    │
│  │  │   Capture   │  │   Times     │  │   Tracking  │             │    │
│  │  │ • Stack     │  │ • API       │  │ • Source    │             │    │
│  │  │   Traces    │  │   Response  │  │   Maps      │             │    │
│  │  │ • User      │  │   Times     │  │             │             │    │
│  │  │   Context   │  │ • Core      │  │             │             │    │
│  │  │             │  │   Vitals    │  │             │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Performance & Optimization

### Performance Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PERFORMANCE OPTIMIZATIONS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  NEXT.JS OPTIMIZATIONS                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │   Server    │  │   Static    │  │   Image     │             │    │
│  │  │ Components  │  │ Generation  │  │ Optimization│             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • SSR       │  │ • Build     │  │ • Next      │             │    │
│  │  │ • RSC       │  │   Time      │  │   Image     │             │    │
│  │  │ • Streaming │  │ • ISR       │  │ • WebP/AVIF │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │   Bundle    │  │   Code      │  │   Caching   │             │    │
│  │  │Optimization │  │  Splitting  │  │ Strategy    │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • Tree      │  │ • Route     │  │ • Browser   │             │    │
│  │  │   Shaking   │  │   Based     │  │   Cache     │             │    │
│  │  │ • Dead Code │  │ • Component │  │ • CDN       │             │    │
│  │  │   Elimination│  │   Based     │  │   Cache     │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  DATABASE OPTIMIZATIONS                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │ Connection  │  │   Query     │  │   Index     │             │    │
│  │  │  Pooling    │  │Optimization │  │ Strategy    │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • Neon      │  │ • Drizzle   │  │ • Primary   │             │    │
│  │  │   Pooling   │  │   Query     │  │   Keys      │             │    │
│  │  │ • Connection│  │   Builder   │  │ • Foreign   │             │    │
│  │  │   Reuse     │  │ • Prepared  │  │   Keys      │             │    │
│  │  │             │  │   Statements│  │ • Email     │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  FRONTEND OPTIMIZATIONS                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │    │
│  │  │  Tailwind   │  │   Theme     │  │   Form      │             │    │
│  │  │    CSS      │  │ Switching   │  │ Validation  │             │    │
│  │  │             │  │             │  │             │             │    │
│  │  │ • JIT       │  │ • CSS       │  │ • Client    │             │    │
│  │  │   Compilation│  │   Variables │  │   Side      │             │    │
│  │  │ • Purging   │  │ • System    │  │ • Real-time │             │    │
│  │  │ • Minimal   │  │   Preference│  │ • Debounced │             │    │
│  │  │   Bundle    │  │             │  │             │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Usage Instructions

### Getting Started
1. **Environment Setup**: Copy `.env.local.example` to `.env.local` and configure all required environment variables
2. **Database Setup**: Run `npm run db:generate` to create migration files, then `npm run db:migrate` to apply them
3. **Development**: Use `npm run dev` to start the development server with Turbopack
4. **Authentication**: Configure Kinde Auth settings in your Kinde dashboard
5. **Monitoring**: Set up Sentry project and configure DSN for error tracking

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations

### Directory Structure
- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/db` - Database configuration and migrations
- `/lib` - Utility functions and query helpers
- `/zod-schema` - Data validation schemas
- `/constants` - Application constants
- `/markdownfiles` - Documentation and guides

This architecture provides a scalable, maintainable foundation for the computer repair shop application with modern web technologies and best practices.