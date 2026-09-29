#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1e2f25d9593cc4f8006d4b1a17f2596429d604517912f08a3069f9184b5d1a79/contract';
import endContract from '../../snapshots/1e2f25d9593cc4f8006d4b1a17f2596429d604517912f08a3069f9184b5d1a79/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/bcb46511cb6be59c6e01c5d1b16d9633bbcad89b310e3787ce5ae94dfb8d62d7/contract';
import startContract from '../../snapshots/bcb46511cb6be59c6e01c5d1b16d9633bbcad89b310e3787ce5ae94dfb8d62d7/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropDefault({ schema: 'public', table: 'Business', column: 'updatedAt' }),
      this.createTable({
        schema: 'public',
        table: 'Integration',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('credentials', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DISCONNECTED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('workspaceId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Integration_provider_check_fb636621',
            "\"provider\" IN ('GROK', 'GOOGLE', 'GMAIL', 'SLACK', 'WHATSAPP', 'STRIPE')",
          ),
          checkExpression(
            'Integration_status_check_2d79173c',
            "\"status\" IN ('CONNECTED', 'DISCONNECTED', 'ERROR')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Workspace',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'WorkspaceMember',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workspaceId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WorkspaceMember_role_check_50a44636',
            "\"role\" IN ('OWNER', 'ADMIN', 'MEMBER')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('updatedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.dataTransform(endContract, 'backfill-User-updatedAt', {
        check: () => placeholder('backfill-User-updatedAt:check'),
        run: () => placeholder('backfill-User-updatedAt:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'User', column: 'updatedAt' }),
      this.dataTransform(endContract, 'typechange-Business-id', {
        check: () => placeholder('typechange-Business-id:check'),
        run: () => placeholder('typechange-Business-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Business',
        column: 'id',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.dataTransform(endContract, 'typechange-Business-ownerId', {
        check: () => placeholder('typechange-Business-ownerId:check'),
        run: () => placeholder('typechange-Business-ownerId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Business',
        column: 'ownerId',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.dataTransform(endContract, 'typechange-Lead-businessId', {
        check: () => placeholder('typechange-Lead-businessId:check'),
        run: () => placeholder('typechange-Lead-businessId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Lead',
        column: 'businessId',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.dataTransform(endContract, 'typechange-Lead-id', {
        check: () => placeholder('typechange-Lead-id:check'),
        run: () => placeholder('typechange-Lead-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Lead',
        column: 'id',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.dataTransform(endContract, 'typechange-User-id', {
        check: () => placeholder('typechange-User-id:check'),
        run: () => placeholder('typechange-User-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'User',
        column: 'id',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.addUnique({
        schema: 'public',
        table: 'Integration',
        constraint: 'Integration_workspaceId_provider_key',
        columns: ['workspaceId', 'provider'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Workspace',
        constraint: 'Workspace_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WorkspaceMember',
        constraint: 'WorkspaceMember_userId_workspaceId_key',
        columns: ['userId', 'workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Integration',
        index: 'Integration_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Workspace',
        index: 'Workspace_slug_idx_73b7f5ce',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WorkspaceMember',
        index: 'WorkspaceMember_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Integration',
        foreignKey: {
          name: 'Integration_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WorkspaceMember',
        foreignKey: {
          name: 'WorkspaceMember_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
