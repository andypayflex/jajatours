import db from '../connection.js';
import { nanoid } from 'nanoid';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(): string {
  const id = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  db.prepare('INSERT INTO sessions (id, expires_at) VALUES (?, ?)').run(id, expiresAt);
  return id;
}

export function validateSession(id: string): boolean {
  const row = db.prepare(
    'SELECT id FROM sessions WHERE id = ? AND expires_at > datetime(\'now\')'
  ).get(id) as { id: string } | undefined;
  return !!row;
}

export function deleteSession(id: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function cleanExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at <= datetime(\'now\')').run();
}
