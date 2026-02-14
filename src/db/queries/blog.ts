import db from '../connection.js';
import { nanoid } from 'nanoid';
import type { BlogPost } from '../types.js';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  main_image: string | null;
  main_image_alt: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function rowToPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    body: row.body ?? undefined,
    mainImage: row.main_image ?? undefined,
    mainImageAlt: row.main_image_alt ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const rows = db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all() as BlogRow[];
  return rows.map(rowToPost);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const row = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug) as BlogRow | undefined;
  return row ? rowToPost(row) : undefined;
}

export function getBlogPostById(id: string): BlogPost | undefined {
  const row = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id) as BlogRow | undefined;
  return row ? rowToPost(row) : undefined;
}

export function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost {
  const id = nanoid();
  db.prepare(`
    INSERT INTO blog_posts (id, title, slug, excerpt, body, main_image, main_image_alt, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, post.title, post.slug, post.excerpt ?? null, post.body ?? null,
    post.mainImage ?? null, post.mainImageAlt ?? null,
    post.publishedAt ?? new Date().toISOString(),
  );
  return getBlogPostById(id)!;
}

export function updateBlogPost(id: string, post: Partial<BlogPost>): BlogPost | undefined {
  const existing = getBlogPostById(id);
  if (!existing) return undefined;

  db.prepare(`
    UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, body = ?,
      main_image = ?, main_image_alt = ?, published_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    post.title ?? existing.title,
    post.slug ?? existing.slug,
    post.excerpt ?? existing.excerpt ?? null,
    post.body ?? existing.body ?? null,
    post.mainImage ?? existing.mainImage ?? null,
    post.mainImageAlt ?? existing.mainImageAlt ?? null,
    post.publishedAt ?? existing.publishedAt ?? null,
    id,
  );
  return getBlogPostById(id);
}

export function deleteBlogPost(id: string): boolean {
  const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getBlogPostCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
  return row.count;
}
