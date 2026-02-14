import db from '../connection.js';
import { nanoid } from 'nanoid';
import type { GalleryImage } from '../types.js';

interface GalleryRow {
  id: string;
  image: string;
  alt: string;
  caption: string | null;
  tour_id: string | null;
  tour_title: string | null;
  tags: string | null;
  published_at: string | null;
  created_at: string | null;
}

function rowToImage(row: GalleryRow): GalleryImage {
  return {
    id: row.id,
    image: row.image,
    alt: row.alt,
    caption: row.caption ?? undefined,
    tourId: row.tour_id ?? undefined,
    tourTitle: row.tour_title ?? undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function getAllGalleryImages(): GalleryImage[] {
  const rows = db.prepare(`
    SELECT g.*, t.title as tour_title
    FROM gallery_images g LEFT JOIN tours t ON g.tour_id = t.id
    ORDER BY g.published_at DESC
  `).all() as GalleryRow[];
  return rows.map(rowToImage);
}

export function getGalleryImageById(id: string): GalleryImage | undefined {
  const row = db.prepare(`
    SELECT g.*, t.title as tour_title
    FROM gallery_images g LEFT JOIN tours t ON g.tour_id = t.id
    WHERE g.id = ?
  `).get(id) as GalleryRow | undefined;
  return row ? rowToImage(row) : undefined;
}

export function createGalleryImage(img: Omit<GalleryImage, 'id' | 'createdAt' | 'tourTitle'>): GalleryImage {
  const id = nanoid();
  db.prepare(`
    INSERT INTO gallery_images (id, image, alt, caption, tour_id, tags, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, img.image, img.alt, img.caption ?? null, img.tourId ?? null,
    img.tags ? JSON.stringify(img.tags) : null,
    img.publishedAt ?? new Date().toISOString(),
  );
  return getGalleryImageById(id)!;
}

export function updateGalleryImage(id: string, img: Partial<GalleryImage>): GalleryImage | undefined {
  const existing = getGalleryImageById(id);
  if (!existing) return undefined;

  db.prepare(`
    UPDATE gallery_images SET image = ?, alt = ?, caption = ?, tour_id = ?, tags = ?, published_at = ?
    WHERE id = ?
  `).run(
    img.image ?? existing.image,
    img.alt ?? existing.alt,
    img.caption ?? existing.caption ?? null,
    img.tourId ?? existing.tourId ?? null,
    JSON.stringify(img.tags ?? existing.tags ?? null),
    img.publishedAt ?? existing.publishedAt ?? null,
    id,
  );
  return getGalleryImageById(id);
}

export function deleteGalleryImage(id: string): boolean {
  const result = db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getGalleryImageCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM gallery_images').get() as { count: number };
  return row.count;
}
