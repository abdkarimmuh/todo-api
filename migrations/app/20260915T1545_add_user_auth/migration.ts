#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/59eeaf1de5081000ba06246c25e6ca9e52efce94ba06cc2ec9f1e6896dc7dc39/contract';
import endContract from '../../snapshots/59eeaf1de5081000ba06246c25e6ca9e52efce94ba06cc2ec9f1e6896dc7dc39/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b237af34dbdefe1e77cde16e8f63da9735661f088c65558034f84a319788ee87/contract';
import startContract from '../../snapshots/b237af34dbdefe1e77cde16e8f63da9735661f088c65558034f84a319788ee87/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';
import postgres from '@prisma/orm-postgres/runtime';
import { randomUUID } from 'crypto';
import { hash } from 'argon2';

const { sql, raw, contract } = postgres<End>({ contractJson: endContract });

const LEGACY_USER_ID = '00000000-0000-0000-0000-000000000000';
const legacyPasswordHash = await hash(randomUUID());

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'todo',
        column: col('userId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.dataTransform(contract, 'backfill-todo-userId', {
        check: () =>
          sql.public.todo.select('id').where((f, fns) => fns.eq(f.userId, null)).limit(1),
        run: () =>
          raw.sql`
            WITH legacy_user AS (
              INSERT INTO "public"."user" ("id", "email", "password")
              VALUES (${LEGACY_USER_ID}, 'legacy-data@system.local', ${legacyPasswordHash})
              ON CONFLICT ("id") DO NOTHING
            )
            UPDATE "public"."todo" SET "userId" = ${LEGACY_USER_ID} WHERE "userId" IS NULL
          `.affectedCount(),
      }),
      this.setNotNull({ schema: 'public', table: 'todo', column: 'userId' }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'todo',
        index: 'todo_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'todo',
        foreignKey: {
          name: 'todo_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
