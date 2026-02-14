import db from '../connection.js';
import { nanoid } from 'nanoid';
import type { Tour } from '../types.js';

interface TourRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  duration: string | null;
  main_image: string | null;
  main_image_alt: string | null;
  pricing: string | null;
  group_size: string | null;
  inclusions: string | null;
  exclusions: string | null;
  itinerary: string | null;
  safety_info: string | null;
  available_dates: string | null;
  tags: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function rowToTour(row: TourRow): Tour {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    body: row.body ?? undefined,
    category: row.category ?? undefined,
    duration: row.duration ?? undefined,
    mainImage: row.main_image ?? undefined,
    mainImageAlt: row.main_image_alt ?? undefined,
    pricing: row.pricing ? JSON.parse(row.pricing) : undefined,
    groupSize: row.group_size ? JSON.parse(row.group_size) : undefined,
    inclusions: row.inclusions ? JSON.parse(row.inclusions) : undefined,
    exclusions: row.exclusions ? JSON.parse(row.exclusions) : undefined,
    itinerary: row.itinerary ? JSON.parse(row.itinerary) : undefined,
    safetyInfo: row.safety_info ? JSON.parse(row.safety_info) : undefined,
    availableDates: row.available_dates ? JSON.parse(row.available_dates) : undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function getAllTours(): Tour[] {
  const rows = db.prepare(
    'SELECT * FROM tours ORDER BY published_at DESC'
  ).all() as TourRow[];
  return rows.map(rowToTour);
}

export function getTourBySlug(slug: string): Tour | undefined {
  const row = db.prepare(
    'SELECT * FROM tours WHERE slug = ?'
  ).get(slug) as TourRow | undefined;
  return row ? rowToTour(row) : undefined;
}

export function getTourById(id: string): Tour | undefined {
  const row = db.prepare(
    'SELECT * FROM tours WHERE id = ?'
  ).get(id) as TourRow | undefined;
  return row ? rowToTour(row) : undefined;
}

export function createTour(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Tour {
  const id = nanoid();
  db.prepare(`
    INSERT INTO tours (id, title, slug, excerpt, body, category, duration, main_image, main_image_alt,
      pricing, group_size, inclusions, exclusions, itinerary, safety_info, available_dates, tags, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    tour.title,
    tour.slug,
    tour.excerpt ?? null,
    tour.body ?? null,
    tour.category ?? null,
    tour.duration ?? null,
    tour.mainImage ?? null,
    tour.mainImageAlt ?? null,
    tour.pricing ? JSON.stringify(tour.pricing) : null,
    tour.groupSize ? JSON.stringify(tour.groupSize) : null,
    tour.inclusions ? JSON.stringify(tour.inclusions) : null,
    tour.exclusions ? JSON.stringify(tour.exclusions) : null,
    tour.itinerary ? JSON.stringify(tour.itinerary) : null,
    tour.safetyInfo ? JSON.stringify(tour.safetyInfo) : null,
    tour.availableDates ? JSON.stringify(tour.availableDates) : null,
    tour.tags ? JSON.stringify(tour.tags) : null,
    tour.publishedAt ?? new Date().toISOString(),
  );
  return getTourById(id)!;
}

export function updateTour(id: string, tour: Partial<Tour>): Tour | undefined {
  const existing = getTourById(id);
  if (!existing) return undefined;

  db.prepare(`
    UPDATE tours SET
      title = ?, slug = ?, excerpt = ?, body = ?, category = ?, duration = ?,
      main_image = ?, main_image_alt = ?,
      pricing = ?, group_size = ?, inclusions = ?, exclusions = ?,
      itinerary = ?, safety_info = ?, available_dates = ?, tags = ?,
      published_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    tour.title ?? existing.title,
    tour.slug ?? existing.slug,
    tour.excerpt ?? existing.excerpt ?? null,
    tour.body ?? existing.body ?? null,
    tour.category ?? existing.category ?? null,
    tour.duration ?? existing.duration ?? null,
    tour.mainImage ?? existing.mainImage ?? null,
    tour.mainImageAlt ?? existing.mainImageAlt ?? null,
    JSON.stringify(tour.pricing ?? existing.pricing ?? null),
    JSON.stringify(tour.groupSize ?? existing.groupSize ?? null),
    JSON.stringify(tour.inclusions ?? existing.inclusions ?? null),
    JSON.stringify(tour.exclusions ?? existing.exclusions ?? null),
    JSON.stringify(tour.itinerary ?? existing.itinerary ?? null),
    JSON.stringify(tour.safetyInfo ?? existing.safetyInfo ?? null),
    JSON.stringify(tour.availableDates ?? existing.availableDates ?? null),
    JSON.stringify(tour.tags ?? existing.tags ?? null),
    tour.publishedAt ?? existing.publishedAt ?? null,
    id,
  );
  return getTourById(id);
}

export function deleteTour(id: string): boolean {
  const result = db.prepare('DELETE FROM tours WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getTourCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM tours').get() as { count: number };
  return row.count;
}
