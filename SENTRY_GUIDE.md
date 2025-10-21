# Sentry Integration Guide for Next.js

## 📋 Table of Contents
- [What is Sentry?](#what-is-sentry)
- [Architecture Overview](#architecture-overview)
- [Configuration Files](#configuration-files)
- [How It All Works Together](#how-it-all-works-together)
- [Configuration Options Explained](#configuration-options-explained)
- [Usage & Best Practices](#usage--best-practices)
- [Troubleshooting](#troubleshooting)

---

## What is Sentry?

**Sentry** is an **error tracking and performance monitoring** service that helps you:
- 🐛 **Track errors** in real-time (both client & server)
- 📊 **Monitor performance** (slow API calls, page loads, etc.)
- 🔍 **Debug issues** with detailed stack traces & context
- 📈 **Analyze user impact** of bugs
- 🚨 **Get alerts** when errors occur

### Why Use Sentry?
Instead of manually checking logs or waiting for users to report bugs, Sentry **automatically captures** errors and sends them to a centralized dashboard where you can:
- See the exact line of code that caused the error
- View user context (browser, OS, actions before error)
- Track error frequency and trends
- Group similar errors together

---

## Architecture Overview

### Sentry in Next.js: The Three Runtimes

Next.js has **three different runtime environments**, and Sentry needs to be configured separately for each:

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR NEXT.JS APPLICATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   BROWSER     │  │  NODE.JS     │  │   EDGE RUNTIME   │   │
│  │  (Client)     │  │  (Server)    │  │   (Middleware)   │   │
│  └───────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│          │                  │                    │              │
│          │                  │                    │              │
└──────────┼──────────────────┼────────────────────┼──────────────┘
           │                  │                    │
           │                  │                    │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │   CLIENT    │    │   SERVER    │    │    EDGE     │
    │   CONFIG    │    │   CONFIG    │    │   CONFIG    │
    │             │    │             │    │             │
    │   (N/A in   │    │  sentry.    │    │  sentry.    │
    │  your app)  │    │  server.    │    │  edge.      │
    │             │    │  config.ts  │    │  config.ts  │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                    │
           └──────────────────┼────────────────────┘
                              │
                       ┌──────▼──────┐
                       │ SENTRY.IO   │
                       │  DASHBOARD  │
                       │             │
                       │  - Errors   │
                       │  - Traces   │
                       │  - Logs     │
                       └─────────────┘
```

---

## Configuration Files

Your app currently has **2 Sentry configuration files**:

### 1. `instrumentation.ts` (Entry Point)
**Location:** `/home/usiel667/DEV/Next js/full_stack_01/repairshop/instrumentation.ts`

**Purpose:** This is the **orchestrator** that loads the correct Sentry config based on the runtime environment.

```typescript
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // For server-side code (API routes, Server Components, etc.)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // For edge runtime (Middleware, Edge API routes)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Automatically captures errors from Next.js request pipeline
export const onRequestError = Sentry.captureRequestError;
```

**Key Points:**
- This file runs **automatically** when your Next.js app starts
- It's called by Next.js's instrumentation hook
- It dynamically imports the correct config based on runtime
- `onRequestError` catches unhandled errors in requests

---

### 2. `sentry.server.config.ts` (Node.js Runtime)
**Location:** `/home/usiel667/DEV/Next js/full_stack_01/repairshop/sentry.server.config.ts`

**Handles:**
- ✅ API Routes (in `/app/api/`)
- ✅ Server Components
- ✅ Server Actions
- ✅ `getServerSideProps` / `getStaticProps` (Pages Router)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://086cc37ed900b48b5670fe6752d0b03f@o4510163230588928.ingest.us.sentry.io/4510163270369280",
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});
```

---

### 3. `sentry.edge.config.ts` (Edge Runtime)
**Location:** `/home/usiel667/DEV/Next js/full_stack_01/repairshop/sentry.edge.config.ts`

**Handles:**
- ✅ Middleware (`middleware.ts`)
- ✅ Edge API Routes (routes marked with `export const runtime = 'edge'`)
- ✅ Edge Server Components

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://086cc37ed900b48b5670fe6752d0b03f@o4510163230588928.ingest.us.sentry.io/4510163270369280",
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});
```

**Note:** Your app is **missing** `sentry.client.config.ts` (for browser-side errors). You may want to add this if you want to track client-side errors.

---

## How It All Works Together

### 🔄 Flow Diagram: Error Capture & Reporting

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  Request to Next.js    │
                    └───────────┬────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            │                   │                   │
    ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
    │  Middleware    │  │  API Route     │  │  Server     │
    │  (Edge)        │  │  (Node.js)     │  │  Component  │
    └───────┬────────┘  └───────┬────────┘  └──────┬──────┘
            │                   │                   │
            │  Error occurs?    │  Error occurs?    │
            │                   │                   │
    ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
    │ sentry.edge    │  │ sentry.server  │  │ sentry.     │
    │ .config.ts     │  │ .config.ts     │  │ server.     │
    │ captures error │  │ captures error │  │ config.ts   │
    └───────┬────────┘  └───────┬────────┘  └──────┬──────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Sentry SDK Process   │
                    │   - Sanitize data      │
                    │   - Add context        │
                    │   - Create event       │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Send to Sentry.io    │
                    │   via DSN endpoint     │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Sentry Dashboard     │
                    │   - Issue created      │
                    │   - Team notified      │
                    │   - Metrics updated    │
                    └────────────────────────┘
```

---

### 📊 Detailed Flow Example: API Route Error

Let's trace what happens when an error occurs in an API route:

```
1. User Request
   └─> POST /api/tickets
   
2. Next.js Router
   └─> Routes to API handler in app/api/tickets/route.ts
   
3. instrumentation.ts
   └─> Has already loaded sentry.server.config.ts at startup
   
4. API Handler Executes
   └─> try {
         await db.query(badSQL)  // ❌ SQL syntax error
       }
   
5. Error Thrown
   └─> Sentry SDK automatically captures:
       - Error type: SQLException
       - Stack trace
       - Request details (URL, method, headers)
       - User context (if available)
       - Environment variables
       - Breadcrumbs (previous actions)
   
6. Error Sent to Sentry
   └─> Transmitted via HTTPS to your DSN endpoint
   
7. Sentry.io Dashboard
   └─> Creates issue with:
       - Error message
       - Stack trace with code context
       - Request details
       - Environment (production/dev)
       - Source maps (shows original TypeScript code)
   
8. Response to User
   └─> Next.js returns 500 error
       (Sentry capture doesn't affect response)
```

---

## Configuration Options Explained

### 🔑 DSN (Data Source Name)
```typescript
dsn: "https://086cc37ed900b48b5670fe6752d0b03f@o4510163230588928.ingest.us.sentry.io/4510163270369280"
```

**What it is:**
- Your **unique project identifier** in Sentry
- Like an API key + project ID combined
- Safe to expose publicly (it's meant to be in client code)

**Structure breakdown:**
```
https://[PUBLIC_KEY]@[ORGANIZATION_ID].ingest.us.sentry.io/[PROJECT_ID]
         ↑              ↑                                      ↑
    Public key    Your org ID                           Your project ID
```

---

### 📈 tracesSampleRate
```typescript
tracesSampleRate: 1
```

**What it is:**
- Controls **performance monitoring** sampling
- Value between `0.0` (0%) and `1.0` (100%)
- `1` = capture **ALL** performance traces

**Why it matters:**
- Higher rate = more data = better insights
- Higher rate = more costs (Sentry charges per trace)
- Recommended settings:
  - **Development:** `1.0` (100%)
  - **Production:** `0.1` - `0.2` (10-20%)

**What are "traces"?**
- Performance measurements of:
  - API call duration
  - Database query time
  - External API calls
  - Page load time

**Example:**
```typescript
tracesSampleRate: 0.1  // Only sample 10% of requests
// or use dynamic sampling:
tracesSampler: (samplingContext) => {
  // Sample 100% of checkout page requests
  if (samplingContext.location?.pathname === '/checkout') {
    return 1.0;
  }
  // Sample 10% of everything else
  return 0.1;
}
```

---

### 📝 enableLogs
```typescript
enableLogs: true
```

**What it does:**
- Sends `console.log`, `console.error`, etc. to Sentry
- Helps correlate logs with errors
- Adds log messages as "breadcrumbs"

**Example:**
```typescript
console.log('User clicked checkout button');  // Sent to Sentry
console.error('Payment failed');               // Sent to Sentry

// Later, when error occurs, you see both logs in context
```

---

### 🐛 debug
```typescript
debug: false
```

**What it does:**
- `true`: Prints Sentry operations to console (verbose)
- `false`: Silent operation

**When to use:**
- **Development:** Set to `true` to see what Sentry is doing
- **Production:** Always `false` to avoid console spam

**Example output when `debug: true`:**
```
[Sentry] Sending event: TypeError: Cannot read property...
[Sentry] Event sent successfully: event-id-12345
[Sentry] Creating transaction: GET /api/users
```

---

## Usage & Best Practices

### 🎯 Manual Error Capture

While Sentry auto-captures errors, you can also manually report:

#### Server Components / API Routes
```typescript
import * as Sentry from '@sentry/nextjs';

// Capture an exception
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: 'payment' },
    extra: { orderId: 123 }
  });
  throw error; // Re-throw if needed
}

// Capture a message
Sentry.captureMessage('User clicked upgrade button', 'info');
```

---

### 🏷️ Adding Context to Errors

Make errors more useful by adding context:

```typescript
import * as Sentry from '@sentry/nextjs';

// Set user context (helps identify affected users)
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name
});

// Add tags (for filtering in dashboard)
Sentry.setTag('page_locale', 'en-us');
Sentry.setTag('subscription_tier', 'premium');

// Add custom context
Sentry.setContext('order', {
  id: orderId,
  total: 99.99,
  items: ['product-1', 'product-2']
});
```

---

### 🍞 Breadcrumbs (User Activity Trail)

Breadcrumbs are automatic, but you can add custom ones:

```typescript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info'
});

Sentry.addBreadcrumb({
  category: 'api',
  message: 'Fetching user data',
  data: { userId: 123 }
});
```

When an error occurs, you'll see a timeline:
```
1. User logged in (2 minutes ago)
2. Fetching user data (1 minute ago)
3. Database query (30 seconds ago)
4. ❌ Error: Connection timeout
```

---

### ⚙️ Environment Configuration

Use environment variables for different configs:

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV, // 'development' | 'production'
  
  // Only sample in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug only in dev
  debug: process.env.NODE_ENV === 'development',
  
  // Don't send events in local dev
  enabled: process.env.NODE_ENV !== 'development',
});
```

---

### 🔒 Security Best Practices

#### 1. Filter Sensitive Data
```typescript
Sentry.init({
  dsn: "...",
  
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection'
  ],
});
```

#### 2. Don't Log Secrets
```typescript
// ❌ BAD
console.log('API Key:', process.env.SECRET_API_KEY);

// ✅ GOOD
console.log('API call initiated');
```

---

### 📦 Release Tracking

Track which version caused errors:

```typescript
Sentry.init({
  dsn: "...",
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA, // Use git commit
});
```

In your dashboard, you'll see:
- Which release introduced the bug
- Deploy-to-deploy comparisons
- Regressions

---

## Troubleshooting

### ❌ Errors Not Appearing in Dashboard

**Check:**
1. Is `debug: true` showing errors being sent?
2. Is your DSN correct?
3. Is Sentry enabled? (Check `enabled` config)
4. Are you on a paid plan? (Free tier has limits)

**Test manually:**
```typescript
// Add this to any API route
Sentry.captureMessage('Test from Next.js API');
```

---

### ⚠️ Too Many Events (Quota Issues)

**Solutions:**
1. Lower `tracesSampleRate` to `0.1` or `0.2`
2. Use `beforeSend` to filter events
3. Add `ignoreErrors` for known issues
4. Upgrade your Sentry plan

---

### 🐌 Performance Impact

Sentry has **minimal impact** but you can optimize:

```typescript
Sentry.init({
  dsn: "...",
  
  // Only capture errors, not performance
  tracesSampleRate: 0,
  
  // Limit breadcrumbs
  maxBreadcrumbs: 50,
  
  // Don't attach stack traces to messages
  attachStacktrace: false,
});
```

---

### 🔍 Source Maps Not Working

If stack traces show minified code instead of your TypeScript:

1. Check `next.config.js` has Sentry plugin:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "your-org",
    project: "your-project",
  },
  {
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

2. Ensure you have auth token in `.env`:
```bash
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## 📚 Additional Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Your Dashboard:** https://sentry.io/organizations/[your-org]/issues/
- **Pricing:** https://sentry.io/pricing/
- **SDK Reference:** https://docs.sentry.io/platforms/javascript/configuration/options/

---

## 🎯 Quick Reference

| File | Purpose | When It Runs |
|------|---------|-------------|
| `instrumentation.ts` | Entry point, loads correct config | App startup |
| `sentry.server.config.ts` | Node.js runtime (API routes, Server Components) | When Node.js code runs |
| `sentry.edge.config.ts` | Edge runtime (Middleware) | When edge functions run |
| `sentry.client.config.ts` | Browser runtime (Client Components) | ⚠️ Missing in your app |

---

**Last Updated:** October 10, 2025
**Your Sentry Project ID:** 4510163270369280
**Organization ID:** o4510163230588928
