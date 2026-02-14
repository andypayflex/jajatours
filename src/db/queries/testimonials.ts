import db from '../connection.js';
import { nanoid } from 'nanoid';
import type { Testimonial } from '../types.js';

interface TestimonialRow {
  id: string;
  customer_name: string;
  customer_photo: string | null;
  quote: string;
  rating: number;
  tour_id: string | null;
  tour_title: string | null;
  published_at: string | null;
  created_at: string | null;
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhoto: row.customer_photo ?? undefined,
    quote: row.quote,
    rating: row.rating,
    tourId: row.tour_id ?? undefined,
    tourTitle: row.tour_title ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function getAllTestimonials(): Testimonial[] {
  const rows = db.prepare(`
    SELECT te.*, t.title as tour_title
    FROM testimonials te LEFT JOIN tours t ON te.tour_id = t.id
    ORDER BY te.published_at DESC
  `).all() as TestimonialRow[];
  return rows.map(rowToTestimonial);
}

export function getTestimonialById(id: string): Testimonial | undefined {
  const row = db.prepare(`
    SELECT te.*, t.title as tour_title
    FROM testimonials te LEFT JOIN tours t ON te.tour_id = t.id
    WHERE te.id = ?
  `).get(id) as TestimonialRow | undefined;
  return row ? rowToTestimonial(row) : undefined;
}

export function createTestimonial(t: Omit<Testimonial, 'id' | 'createdAt' | 'tourTitle'>): Testimonial {
  const id = nanoid();
  db.prepare(`
    INSERT INTO testimonials (id, customer_name, customer_photo, quote, rating, tour_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, t.customerName, t.customerPhoto ?? null, t.quote, t.rating,
    t.tourId ?? null, t.publishedAt ?? new Date().toISOString(),
  );
  return getTestimonialById(id)!;
}

export function updateTestimonial(id: string, t: Partial<Testimonial>): Testimonial | undefined {
  const existing = getTestimonialById(id);
  if (!existing) return undefined;

  db.prepare(`
    UPDATE testimonials SET customer_name = ?, customer_photo = ?, quote = ?, rating = ?,
      tour_id = ?, published_at = ?
    WHERE id = ?
  `).run(
    t.customerName ?? existing.customerName,
    t.customerPhoto ?? existing.customerPhoto ?? null,
    t.quote ?? existing.quote,
    t.rating ?? existing.rating,
    t.tourId ?? existing.tourId ?? null,
    t.publishedAt ?? existing.publishedAt ?? null,
    id,
  );
  return getTestimonialById(id);
}

export function deleteTestimonial(id: string): boolean {
  const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getTestimonialCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  return row.count;
}
