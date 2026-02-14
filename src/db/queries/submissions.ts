import db from '../connection.js';
import { nanoid } from 'nanoid';
import type { ContactSubmission, InquirySubmission } from '../types.js';

interface ContactRow {
  id: string;
  name: string;
  email: string;
  interest: string | null;
  message: string | null;
  created_at: string | null;
}

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tour: string | null;
  group_size: string | null;
  dates: string | null;
  message: string | null;
  created_at: string | null;
}

export function createContactSubmission(data: Omit<ContactSubmission, 'id' | 'createdAt'>): ContactSubmission {
  const id = nanoid();
  db.prepare(`
    INSERT INTO contact_submissions (id, name, email, interest, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.name, data.email, data.interest ?? null, data.message ?? null);

  const row = db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id) as ContactRow;
  return {
    id: row.id, name: row.name, email: row.email,
    interest: row.interest ?? undefined, message: row.message ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function createInquirySubmission(data: Omit<InquirySubmission, 'id' | 'createdAt'>): InquirySubmission {
  const id = nanoid();
  db.prepare(`
    INSERT INTO inquiry_submissions (id, name, email, phone, tour, group_size, dates, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.email, data.phone ?? null, data.tour ?? null,
    data.groupSize ?? null, data.dates ?? null, data.message ?? null);

  const row = db.prepare('SELECT * FROM inquiry_submissions WHERE id = ?').get(id) as InquiryRow;
  return {
    id: row.id, name: row.name, email: row.email,
    phone: row.phone ?? undefined, tour: row.tour ?? undefined,
    groupSize: row.group_size ?? undefined, dates: row.dates ?? undefined,
    message: row.message ?? undefined, createdAt: row.created_at ?? undefined,
  };
}

export function getAllContactSubmissions(): ContactSubmission[] {
  const rows = db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC').all() as ContactRow[];
  return rows.map(r => ({
    id: r.id, name: r.name, email: r.email,
    interest: r.interest ?? undefined, message: r.message ?? undefined,
    createdAt: r.created_at ?? undefined,
  }));
}

export function getAllInquirySubmissions(): InquirySubmission[] {
  const rows = db.prepare('SELECT * FROM inquiry_submissions ORDER BY created_at DESC').all() as InquiryRow[];
  return rows.map(r => ({
    id: r.id, name: r.name, email: r.email,
    phone: r.phone ?? undefined, tour: r.tour ?? undefined,
    groupSize: r.group_size ?? undefined, dates: r.dates ?? undefined,
    message: r.message ?? undefined, createdAt: r.created_at ?? undefined,
  }));
}

export function getContactSubmissionCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get() as { count: number };
  return row.count;
}

export function getInquirySubmissionCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM inquiry_submissions').get() as { count: number };
  return row.count;
}
