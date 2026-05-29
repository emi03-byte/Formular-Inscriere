import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FormPayload } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const usePostgres = Boolean(process.env.DATABASE_URL)

export type SavedChild = {
  id: number
  fullName: string
  age: number
}

export type SavedSubmission = {
  id: number
  parentFullName: string
  parentEmail: string
  parentPhone: string | null
  createdAt: string
  consentTerms: boolean
  consentMedia: boolean
  consentMarketing: boolean
  signatureData: string
  children: SavedChild[]
}

type SqliteDb = import('better-sqlite3').Database

let sqliteDb: SqliteDb | null = null
let pgPool: import('pg').Pool | null = null

const CONSENT_COLUMNS = `
  consent_terms INTEGER NOT NULL DEFAULT 0,
  consent_media INTEGER NOT NULL DEFAULT 0,
  consent_marketing INTEGER NOT NULL DEFAULT 0,
  signature_data TEXT NOT NULL DEFAULT ''
`

const SCHEMA_SQLITE = `
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_full_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ${CONSENT_COLUMNS}
  );

  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
  );
`

const SCHEMA_POSTGRES = `
  CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    parent_full_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consent_terms BOOLEAN NOT NULL DEFAULT false,
    consent_media BOOLEAN NOT NULL DEFAULT false,
    consent_marketing BOOLEAN NOT NULL DEFAULT false,
    signature_data TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL
  );
`

async function migratePostgres(): Promise<void> {
  if (!pgPool) return
  await pgPool.query(`
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS consent_terms BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS consent_media BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS signature_data TEXT NOT NULL DEFAULT '';
  `)
}

function migrateSqlite(db: SqliteDb): void {
  const columns = db
    .prepare('PRAGMA table_info(submissions)')
    .all() as Array<{ name: string }>
  const names = new Set(columns.map((col) => col.name))

  if (!names.has('consent_terms')) {
    db.exec(
      `ALTER TABLE submissions ADD COLUMN consent_terms INTEGER NOT NULL DEFAULT 0`,
    )
  }
  if (!names.has('consent_media')) {
    db.exec(
      `ALTER TABLE submissions ADD COLUMN consent_media INTEGER NOT NULL DEFAULT 0`,
    )
  }
  if (!names.has('consent_marketing')) {
    db.exec(
      `ALTER TABLE submissions ADD COLUMN consent_marketing INTEGER NOT NULL DEFAULT 0`,
    )
  }
  if (!names.has('signature_data')) {
    db.exec(
      `ALTER TABLE submissions ADD COLUMN signature_data TEXT NOT NULL DEFAULT ''`,
    )
  }
}

export async function initDb(): Promise<void> {
  if (usePostgres) {
    const pg = await import('pg')
    pgPool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
    await pgPool.query(SCHEMA_POSTGRES)
    await migratePostgres()
    return
  }

  const Database = (await import('better-sqlite3')).default
  const isCompiled = __dirname.endsWith(`${path.sep}dist`)
  const dataDir =
    process.env.DATA_DIR ??
    path.join(__dirname, isCompiled ? '../../data' : '../data')
  fs.mkdirSync(dataDir, { recursive: true })
  sqliteDb = new Database(path.join(dataDir, 'inscrieri.db'))
  sqliteDb.pragma('foreign_keys = ON')
  sqliteDb.exec(SCHEMA_SQLITE)
  migrateSqlite(sqliteDb)
}

function validatePayload(payload: FormPayload): void {
  if (!payload.parent.fullName.trim()) {
    throw new Error('Numele părintelui este obligatoriu.')
  }
  if (!payload.parent.email.trim()) {
    throw new Error('Emailul părintelui este obligatoriu.')
  }
  if (payload.children.length === 0) {
    throw new Error('Adăugați cel puțin un copil.')
  }
  for (const child of payload.children) {
    if (!child.fullName.trim()) {
      throw new Error('Numele copilului este obligatoriu.')
    }
    const age = Number(child.age)
    if (!Number.isInteger(age) || age < 1 || age > 18) {
      throw new Error('Vârsta copilului trebuie să fie între 1 și 18.')
    }
  }
  if (!payload.consent?.termsAccepted) {
    throw new Error('Trebuie să acceptați Politica de Confidențialitate și Termenii.')
  }
  if (!payload.signature?.startsWith('data:image/')) {
    throw new Error('Semnătura este obligatorie.')
  }
}

export async function createSubmission(
  payload: FormPayload,
): Promise<{ id: number; createdAt: string }> {
  validatePayload(payload)

  const parentPhone = payload.parent.phone.trim() || null

  if (usePostgres && pgPool) {
    const client = await pgPool.connect()
    try {
      await client.query('BEGIN')
      const submissionResult = await client.query<{ id: number; created_at: Date }>(
        `INSERT INTO submissions (
           parent_full_name, parent_email, parent_phone,
           consent_terms, consent_media, consent_marketing, signature_data
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, created_at`,
        [
          payload.parent.fullName.trim(),
          payload.parent.email.trim(),
          parentPhone,
          payload.consent.termsAccepted,
          payload.consent.mediaAccepted,
          payload.consent.marketingAccepted,
          payload.signature,
        ],
      )
      const submission = submissionResult.rows[0]
      for (const child of payload.children) {
        await client.query(
          `INSERT INTO children (submission_id, full_name, age) VALUES ($1, $2, $3)`,
          [submission.id, child.fullName.trim(), Number(child.age)],
        )
      }
      await client.query('COMMIT')
      return {
        id: submission.id,
        createdAt: submission.created_at.toISOString(),
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  if (!sqliteDb) {
    throw new Error('Baza de date nu este inițializată.')
  }

  const insertSubmission = sqliteDb.prepare(
    `INSERT INTO submissions (
       parent_full_name, parent_email, parent_phone,
       consent_terms, consent_media, consent_marketing, signature_data
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertChild = sqliteDb.prepare(
    `INSERT INTO children (submission_id, full_name, age) VALUES (?, ?, ?)`,
  )

  const tx = sqliteDb.transaction(() => {
    const result = insertSubmission.run(
      payload.parent.fullName.trim(),
      payload.parent.email.trim(),
      parentPhone,
      payload.consent.termsAccepted ? 1 : 0,
      payload.consent.mediaAccepted ? 1 : 0,
      payload.consent.marketingAccepted ? 1 : 0,
      payload.signature,
    )
    const submissionId = Number(result.lastInsertRowid)
    for (const child of payload.children) {
      insertChild.run(submissionId, child.fullName.trim(), Number(child.age))
    }
    return submissionId
  })

  const submissionId = tx()
  const row = sqliteDb
    .prepare('SELECT created_at FROM submissions WHERE id = ?')
    .get(submissionId) as { created_at: string }

  return { id: submissionId, createdAt: row.created_at }
}

function mapSubmissionRow(row: {
  id: number
  parent_full_name: string
  parent_email: string
  parent_phone: string | null
  created_at: string | Date
  consent_terms: boolean | number
  consent_media: boolean | number
  consent_marketing: boolean | number
  signature_data: string
}): Omit<SavedSubmission, 'children'> {
  return {
    id: row.id,
    parentFullName: row.parent_full_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    consentTerms: Boolean(row.consent_terms),
    consentMedia: Boolean(row.consent_media),
    consentMarketing: Boolean(row.consent_marketing),
    signatureData: row.signature_data,
  }
}

export async function listSubmissions(): Promise<SavedSubmission[]> {
  if (usePostgres && pgPool) {
    const result = await pgPool.query<{
      id: number
      parent_full_name: string
      parent_email: string
      parent_phone: string | null
      created_at: Date
      consent_terms: boolean
      consent_media: boolean
      consent_marketing: boolean
      signature_data: string
      children: SavedChild[] | null
    }>(
      `SELECT s.id, s.parent_full_name, s.parent_email, s.parent_phone, s.created_at,
              s.consent_terms, s.consent_media, s.consent_marketing, s.signature_data,
              COALESCE(
                json_agg(
                  json_build_object('id', c.id, 'fullName', c.full_name, 'age', c.age)
                  ORDER BY c.id
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
              ) AS children
       FROM submissions s
       LEFT JOIN children c ON c.submission_id = s.id
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
    )

    return result.rows.map((row) => ({
      ...mapSubmissionRow(row),
      children: row.children ?? [],
    }))
  }

  if (!sqliteDb) {
    throw new Error('Baza de date nu este inițializată.')
  }

  const submissions = sqliteDb
    .prepare(
      `SELECT id, parent_full_name, parent_email, parent_phone, created_at,
              consent_terms, consent_media, consent_marketing, signature_data
       FROM submissions ORDER BY created_at DESC`,
    )
    .all() as Array<{
    id: number
    parent_full_name: string
    parent_email: string
    parent_phone: string | null
    created_at: string
    consent_terms: number
    consent_media: number
    consent_marketing: number
    signature_data: string
  }>

  const getChildren = sqliteDb.prepare(
    `SELECT id, full_name, age FROM children WHERE submission_id = ? ORDER BY id`,
  )

  return submissions.map((row) => ({
    ...mapSubmissionRow(row),
    children: (
      getChildren.all(row.id) as Array<{
        id: number
        full_name: string
        age: number
      }>
    ).map((child) => ({
      id: child.id,
      fullName: child.full_name,
      age: child.age,
    })),
  }))
}
