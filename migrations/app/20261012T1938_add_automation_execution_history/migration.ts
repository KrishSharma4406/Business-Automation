#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e2f25d9593cc4f8006d4b1a17f2596429d604517912f08a3069f9184b5d1a79/contract';
import startContract from '../../snapshots/1e2f25d9593cc4f8006d4b1a17f2596429d604517912f08a3069f9184b5d1a79/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/29c03f8388cb6c923af3d129531292d8ece8ff87229e26ff29fb06fe5d6969e6/contract';
import endContract from '../../snapshots/29c03f8388cb6c923af3d129531292d8ece8ff87229e26ff29fb06fe5d6969e6/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
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
      this.createTable({
        schema: 'public',
        table: 'AutomationExecution',
        columns: [
          col('automationId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('businessId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('durationMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('error', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('input', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('output', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('running'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('trigger', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.dataTransform(endContract, 'typechange-Business-id', {
        check: () => placeholder('typechange-Business-id:check'),
        run: () => placeholder('typechange-Business-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Business',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
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
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-Integration-id', {
        check: () => placeholder('typechange-Integration-id:check'),
        run: () => placeholder('typechange-Integration-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Integration',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-Integration-workspaceId', {
        check: () => placeholder('typechange-Integration-workspaceId:check'),
        run: () => placeholder('typechange-Integration-workspaceId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Integration',
        column: 'workspaceId',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
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
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
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
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
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
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-Workspace-id', {
        check: () => placeholder('typechange-Workspace-id:check'),
        run: () => placeholder('typechange-Workspace-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'Workspace',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-WorkspaceMember-id', {
        check: () => placeholder('typechange-WorkspaceMember-id:check'),
        run: () => placeholder('typechange-WorkspaceMember-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'WorkspaceMember',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-WorkspaceMember-userId', {
        check: () => placeholder('typechange-WorkspaceMember-userId:check'),
        run: () => placeholder('typechange-WorkspaceMember-userId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'WorkspaceMember',
        column: 'userId',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-WorkspaceMember-workspaceId', {
        check: () => placeholder('typechange-WorkspaceMember-workspaceId:check'),
        run: () => placeholder('typechange-WorkspaceMember-workspaceId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'WorkspaceMember',
        column: 'workspaceId',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.createIndex({
        schema: 'public',
        table: 'AutomationExecution',
        index: 'AutomationExecution_automationId_idx_4a3c63da',
        columns: ['automationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AutomationExecution',
        index: 'AutomationExecution_automationId_startedAt_idx_d2dd5798',
        columns: ['automationId', 'startedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AutomationExecution',
        index: 'AutomationExecution_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AutomationExecution',
        index: 'AutomationExecution_businessId_startedAt_idx_84083d08',
        columns: ['businessId', 'startedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AutomationExecution',
        index: 'AutomationExecution_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AutomationExecution',
        foreignKey: {
          name: 'AutomationExecution_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'Business', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AutomationExecution',
        foreignKey: {
          name: 'AutomationExecution_automationId_fkey',
          columns: ['automationId'],
          references: { schema: 'public', table: 'Automation', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
