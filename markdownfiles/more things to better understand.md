# More Things to Better Understand

## How Edit vs New Customer Form Works

### Overview
The CustomerForm component uses conditional rendering to display either "Edit Customer Form" or "New Customer Form" based on whether customer data is passed to it.

---

## The Component Structure

### CustomerForm Component (`CustomerForm.tsx`)

```tsx
type Props = {
  customer?: selectCustomerSchemaType;
};

export default function CustomerForm({ customer }: Props) {
```

The `CustomerForm` component accepts an **optional** `customer` prop (indicated by the `?`). This prop can either be:
- A customer object with data (when editing)
- `undefined` (when creating a new customer)

### The Conditional Title

```tsx
<h2 className="text-2xl font-bold">
  {customer?.id ? "Edit" : "New"} Customer Form
</h2>
```

This line uses:
- **Optional chaining** (`?.`) - Safely accesses `id` only if `customer` exists
- **Ternary operator** (`? :`) - Condition ? ValueIfTrue : ValueIfFalse

**How it evaluates:**
- `customer?.id` checks if customer exists AND has an id
- If truthy → displays **"Edit Customer Form"**
- If falsy → displays **"New Customer Form"**

---

## The Page Component Flow

### Page Component (`page.tsx`)

The page component determines which mode to use based on URL parameters:

```tsx
export default async function CustomerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { customerId } = params;
  
  // Edit mode
  if (customerId) {
    const customer = await getCustomer(parseInt(customerId));
    return <CustomerForm customer={customer} />;
  } 
  // New mode
  else {
    return <CustomerForm />;
  }
}
```

---

## Complete Flow Diagram

```
URL: /customers/form
        ↓
  No customerId in URL
        ↓
  <CustomerForm /> (no prop passed)
        ↓
  customer = undefined
        ↓
  customer?.id = undefined (falsy)
        ↓
  Title: "New Customer Form"
```

```
URL: /customers/form?customerId=2
        ↓
  customerId = "2" found in URL
        ↓
  Fetch customer from database
        ↓
  <CustomerForm customer={customerData} />
        ↓
  customer = { id: 2, firstName: "John", ... }
        ↓
  customer?.id = 2 (truthy)
        ↓
  Title: "Edit Customer Form"
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER NAVIGATES TO URL                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ▼                                       ▼
    ┌───────────────────────┐              ┌───────────────────────┐
    │  /customers/form      │              │ /customers/form       │
    │  (No search params)   │              │ ?customerId=2         │
    └───────────┬───────────┘              └───────────┬───────────┘
                │                                       │
                ▼                                       ▼
┌───────────────────────────────────┐  ┌────────────────────────────────────┐
│   CustomerFormPage Component      │  │   CustomerFormPage Component       │
│   (Server Component)              │  │   (Server Component)               │
│                                   │  │                                    │
│   searchParams = {}               │  │   searchParams = {customerId: "2"} │
│   customerId = undefined          │  │   customerId = "2"                 │
└───────────────┬───────────────────┘  └────────────┬───────────────────────┘
                │                                   │
                │                                   ▼
                │                    ┌──────────────────────────────────┐
                │                    │  getCustomer(2)                  │
                │                    │  Database Query                  │
                │                    │  (lib/queries/getCustomer.ts)    │
                │                    └──────────────┬───────────────────┘
                │                                   │
                │                                   ▼
                │                    ┌──────────────────────────────────┐
                │                    │  Returns customer object:        │
                │                    │  {                               │
                │                    │    id: 2,                        │
                │                    │    firstName: "John",            │
                │                    │    lastName: "Doe",              │
                │                    │    email: "john@example.com",    │
                │                    │    ...                           │
                │                    │  }                               │
                │                    └──────────────┬───────────────────┘
                │                                   │
                ▼                                   ▼
    ┌───────────────────────┐          ┌───────────────────────────┐
    │ <CustomerForm />      │          │ <CustomerForm             │
    │                       │          │   customer={customerData} │
    │ No props passed       │          │ />                        │
    └───────────┬───────────┘          └───────────┬───────────────┘
                │                                   │
                │                                   │
                └────────────┬──────────────────────┘
                             ▼
            ┌────────────────────────────────────────────┐
            │      CustomerForm Component                │
            │      (Client Component)                    │
            │                                            │
            │  Props received:                           │
            │  • customer?: selectCustomerSchemaType     │
            └────────────────┬───────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                 ┌───────────────────────┐
│ customer = undef  │                 │ customer = {id: 2,    │
│                   │                 │   firstName: "John",  │
│ defaultValues:    │                 │   ...}                │
│ {                 │                 │                       │
│   id: 0,          │                 │ defaultValues:        │
│   firstName: "",  │                 │ {                     │
│   lastName: "",   │                 │   id: 2,              │
│   ...             │                 │   firstName: "John",  │
│ }                 │                 │   lastName: "Doe",    │
│                   │                 │   ...                 │
└─────────┬─────────┘                 └─────────┬─────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────┐               ┌─────────────────────────┐
│ customer?.id        │               │ customer?.id            │
│ = undefined (falsy) │               │ = 2 (truthy)            │
└─────────┬───────────┘               └─────────┬───────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────┐               ┌─────────────────────────┐
│ Title renders:      │               │ Title renders:          │
│ "New Customer Form" │               │ "Edit Customer Form"    │
└─────────────────────┘               └─────────────────────────┘
          │                                     │
          └────────────┬────────────────────────┘
                       ▼
            ┌──────────────────────┐
            │  React Hook Form     │
            │  (useForm)           │
            │                      │
            │  • Initialized with  │
            │    defaultValues     │
            │  • Zod validation    │
            │  • Mode: onBlur      │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Form Fields Render  │
            │  (Empty or Filled)   │
            └──────────────────────┘
```

---

## Data Flow Between Files

```
┌─────────────────────────────────────────────────────────────┐
│                      FILE STRUCTURE                         │
└─────────────────────────────────────────────────────────────┘

📁 app/(rs)/customers/form/
   ├── 📄 page.tsx (Server Component)
   │    │
   │    ├─► Receives: searchParams from URL
   │    ├─► Extracts: customerId
   │    ├─► Calls: getCustomer(customerId) if exists
   │    └─► Renders: <CustomerForm /> with or without customer prop
   │
   └── 📄 CustomerForm.tsx (Client Component)
        │
        ├─► Receives: customer prop (optional)
        ├─► Creates: defaultValues from customer data
        ├─► Initializes: React Hook Form with defaultValues
        └─► Renders: Form with conditional title

📁 lib/queries/
   └── 📄 getCustomer.ts
        │
        ├─► Receives: customerId (number)
        ├─► Queries: Database for customer
        └─► Returns: Customer object or null

📁 zod-schema/
   └── 📄 customer.ts
        │
        ├─► Defines: insertCustomerSchema (validation rules)
        ├─► Exports: insertCustomerSchemaType (TypeScript type)
        └─► Exports: selectCustomerSchemaType (TypeScript type)

📁 components/ui/
   └── 📄 form.tsx
        │
        └─► Provides: Shadcn UI form components
```

---

## Prop Passing Flow

```
        URL Query String
              │
              ▼
    ┌─────────────────────┐
    │  searchParams       │
    │  {customerId: "2"}  │
    └──────────┬──────────┘
               │
               │ Extract & Parse
               ▼
    ┌─────────────────────┐
    │  customerId = 2     │
    │  (number)           │
    └──────────┬──────────┘
               │
               │ Pass to query function
               ▼
    ┌─────────────────────┐
    │  getCustomer(2)     │
    └──────────┬──────────┘
               │
               │ Returns
               ▼
    ┌─────────────────────┐
    │  customer object    │
    │  {id: 2, ...}       │
    └──────────┬──────────┘
               │
               │ Pass as prop
               ▼
    ┌─────────────────────────┐
    │  <CustomerForm          │
    │    customer={customer}  │
    │  />                     │
    └──────────┬──────────────┘
               │
               │ Destructure in component
               ▼
    ┌─────────────────────────┐
    │  function CustomerForm  │
    │    ({ customer }: Props)│
    └──────────┬──────────────┘
               │
               │ Use in conditional
               ▼
    ┌─────────────────────────┐
    │  customer?.id           │
    │  ? "Edit" : "New"       │
    └─────────────────────────┘
```

---

## Key Concepts Explained

### 1. Optional Chaining (`?.`)
```tsx
customer?.id
```
- If `customer` is `undefined` or `null`, returns `undefined` instead of throwing an error
- If `customer` exists, returns `customer.id`

### 2. Ternary Operator
```tsx
condition ? valueIfTrue : valueIfFalse
```
- Shorthand for if/else statements
- Commonly used for conditional rendering in React

### 3. Optional Props
```tsx
customer?: selectCustomerSchemaType
```
- The `?` after the prop name means it's optional
- Component can work with or without this prop being passed

### 4. URL Search Parameters
```
/customers/form?customerId=2
                └──────────┘
                   Query string
```
- Everything after `?` is a search parameter
- Accessed via `searchParams` in Next.js page components
- Format: `key=value`, multiple params separated by `&`

---

## Practical Usage

### Creating a New Customer
1. Navigate to `/customers/form`
2. No `customerId` in URL
3. Component renders empty form with "New Customer Form" title
4. All fields use empty strings as defaults

### Editing an Existing Customer
1. Navigate to `/customers/form?customerId=2`
2. Page extracts `customerId=2` from URL
3. Fetches customer data from database using `getCustomer(2)`
4. Passes customer object to `<CustomerForm customer={...} />`
5. Form title shows "Edit Customer Form"
6. All fields are pre-filled with existing customer data

---

## Default Values Logic

```tsx
const defaultValues: insertCustomerSchemaType = {
  id: customer?.id || 0,
  firstName: customer?.firstName || "",
  lastName: customer?.lastName || "",
  // ... etc
};
```

Each field uses the **OR operator (`||`)**:
- If `customer?.firstName` exists → use that value
- If `customer?.firstName` is undefined → use empty string `""`

This ensures the form always has valid default values whether in edit or new mode.
