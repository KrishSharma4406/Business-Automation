# Autoleep - AI Business OS

Autoleep is an autonomous business operations platform designed for automated lead qualification, customer management, and event-driven communication workflows.

## Core Capabilities

- Multi-Tenant Authentication: User registration and credential authentication powered by NextAuth and bcrypt with PostgreSQL storage.
- Inbound Lead Ingress: Public webhook endpoint (`/api/webhooks/lead`) and dashboard forms for automated lead intake.
- AI Qualification Engine: Automated lead scoring (0-100), tier prioritization, and personalized response drafting powered by Groq LLM.
- Customer Management: Complete CRUD API and interface for client accounts, contact directories, and service tiers (`/api/customers`).
- Automation Runtime: Event-driven execution engine supporting triggers like `new_lead` and `lead_qualified`.
- Serverless Infrastructure: Database persistence on Neon PostgreSQL with isolated business workspace scoping.

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Database: Neon Serverless PostgreSQL, Prisma
- Authentication: NextAuth v5 (Auth.js)
- AI Inference: Groq SDK
- Communications: Resend API
- Styling: Custom CSS Design System

## Getting Started

### 1. Prerequisites

- Node.js 18 or later
- Neon PostgreSQL database
- Groq API Key

### 2. Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="your-neon-postgres-connection-string"
AUTH_SECRET="your-nextauth-secret"
GROQ_API_KEY="your-groq-api-key"
RESEND_API_KEY="your-resend-api-key"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Key API Routes

- `POST /api/auth/register` - Provision new operator account and business workspace
- `GET, POST /api/customers` - Retrieve and create customer records
- `GET, PATCH, DELETE /api/customers/[id]` - Inspect, update, or remove customer accounts
- `GET, POST /api/webhooks/lead` - Inbound public webhook for automated lead ingestion
- `GET, POST /api/leads` - Lead directory and qualification endpoints
- `GET, POST /api/automations` - Autonomous pipeline configuration
