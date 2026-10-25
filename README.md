# Autozip - AI Business OS

Autozip is an autonomous business operations platform for automated lead qualification, customer management, and event-driven communication workflows.

## Core Capabilities

- **Authentication**: Credentials + Google OAuth with auto-provisioned workspaces, powered by NextAuth v5 and bcrypt with PostgreSQL storage.
- **Inbound Lead Ingress**: Public webhook endpoint (`/api/webhooks/lead`) and dashboard forms for automated lead intake.
- **AI Qualification Engine**: Automated lead scoring (0-100), tier prioritization, and personalized response drafting via Groq LLM.
- **Customer Management**: Full CRUD API and interface for client accounts and contact directories (`/api/customers`).
- **Automation Runtime**: Event-driven execution engine supporting triggers like `new_lead` and `lead_qualified`.
- **Serverless Infrastructure**: Neon PostgreSQL with isolated multi-tenant business workspace scoping.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: Neon Serverless PostgreSQL, Prisma 8
- Authentication: NextAuth v5 (Credentials + Google OAuth)
- AI Inference: Groq SDK
- Communications: Resend API
- Styling: Custom CSS Design System

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- Groq API Key
- Google Cloud OAuth credentials (optional, for Google sign-in)

### 2. Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="your-neon-postgres-connection-string"
AUTH_SECRET="your-nextauth-secret"
GROQ_API_KEY="your-groq-api-key"
RESEND_API_KEY="your-resend-api-key"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

### 3. Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key API Routes

| Route | Methods | Description |
|---|---|---|
| `/api/auth/register` | POST | Provision new operator account and workspace |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler (Credentials + Google OAuth) |
| `/api/customers` | GET, POST | List and create customer records |
| `/api/customers/[id]` | GET, PATCH, DELETE | Manage individual customer accounts |
| `/api/webhooks/lead` | GET, POST | Public webhook for automated lead ingestion |
| `/api/leads` | GET, POST | Lead directory and qualification |
| `/api/automations` | GET, POST | Automation pipeline configuration |
