import { Pool } from "pg";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Global pool instance to prevent connection leaks across Next.js dev reloads
const globalForPg = globalThis as unknown as { pgPool?: Pool };

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

const connectionString = rawConnectionString.replace(/^["']|["']$/g, "").trim();

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export interface DbUser {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Find user by email (case-insensitive)
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const normalized = email.trim().toLowerCase();
  const result = await pool.query<DbUser>(
    `SELECT id, name, email, "passwordHash", "createdAt", "updatedAt"
     FROM "User"
     WHERE LOWER(email) = $1
     LIMIT 1`,
    [normalized]
  );
  return result.rows[0] ?? null;
}

/**
 * Find user by ID
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const result = await pool.query<DbUser>(
    `SELECT id, name, email, "passwordHash", "createdAt", "updatedAt"
     FROM "User"
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Register a new user, provisioning an isolated workspace and business node
 */
export async function registerNewUser(params: {
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const trimmedName = params.name.trim() || "Workspace Node";

  // Check if user already exists
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(params.password, 10);
  const businessId = crypto.randomUUID();
  const workspaceId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  // Create clean, unique slug
  const baseSlug = (trimmedName || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert User
    await client.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, normalizedEmail, trimmedName, passwordHash]
    );

    // 2. Insert Business node for this user
    await client.query(
      `INSERT INTO "Business" (id, "ownerId", name, slug, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [businessId, userId, trimmedName, slug, `Workspace for ${trimmedName}`]
    );

    // 3. Insert Workspace & WorkspaceMember
    await client.query(
      `INSERT INTO "Workspace" (id, name, slug, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (slug) DO NOTHING`,
      [workspaceId, trimmedName, slug]
    );

    await client.query(
      `INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'OWNER', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [memberId, workspaceId, userId]
    );

    await client.query("COMMIT");

    return {
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Find an existing user by email, or create a new one for OAuth sign-in.
 * Also provisions a Business, Workspace, and WorkspaceMember if creating.
 */
export async function findOrCreateOAuthUser(params: {
  email: string;
  name: string | null;
}): Promise<{ id: string; name: string; email: string; isNew: boolean }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const displayName = (params.name || "").trim() || "Workspace Node";

  // Check if user already exists
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    return {
      id: existing.id,
      name: existing.name || displayName,
      email: existing.email,
      isNew: false,
    };
  }

  // Provision new user + business + workspace (same as registerNewUser but no password)
  const userId = crypto.randomUUID();
  const businessId = crypto.randomUUID();
  const workspaceId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  const baseSlug = (displayName || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NULL, NOW(), NOW())`,
      [userId, normalizedEmail, displayName]
    );

    await client.query(
      `INSERT INTO "Business" (id, "ownerId", name, slug, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [businessId, userId, displayName, slug, `Workspace for ${displayName}`]
    );

    await client.query(
      `INSERT INTO "Workspace" (id, name, slug, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (slug) DO NOTHING`,
      [workspaceId, displayName, slug]
    );

    await client.query(
      `INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'OWNER', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [memberId, workspaceId, userId]
    );

    await client.query("COMMIT");

    return {
      id: userId,
      name: displayName,
      email: normalizedEmail,
      isNew: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Store or update an OAuth account link in the Account table
 */
export async function linkOAuthAccount(params: {
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
}): Promise<void> {
  await pool.query(
    `INSERT INTO "Account" (id, "userId", provider, "providerAccountId", "accessToken", "refreshToken", "expiresAt", "tokenType", scope, "idToken", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     ON CONFLICT (provider, "providerAccountId")
     DO UPDATE SET
       "accessToken" = EXCLUDED."accessToken",
       "refreshToken" = EXCLUDED."refreshToken",
       "expiresAt" = EXCLUDED."expiresAt",
       "tokenType" = EXCLUDED."tokenType",
       scope = EXCLUDED.scope,
       "idToken" = EXCLUDED."idToken",
       "updatedAt" = NOW()`,
    [
      params.userId,
      params.provider,
      params.providerAccountId,
      params.accessToken || null,
      params.refreshToken || null,
      params.expiresAt || null,
      params.tokenType || null,
      params.scope || null,
      params.idToken || null,
    ]
  );
}
