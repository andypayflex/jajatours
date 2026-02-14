import sharp from 'sharp';
import { mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads';

// Ensure upload directories exist
mkdirSync(join(UPLOAD_DIR, 'images'), { recursive: true });
mkdirSync(join(UPLOAD_DIR, 'thumbs'), { recursive: true });

export interface UploadResult {
  /** Path relative to uploads dir, e.g. "images/abc123.webp" */
  path: string;
  /** Thumbnail path, e.g. "thumbs/abc123.webp" */
  thumbPath: string;
}

/**
 * Save an uploaded file, optimize it with Sharp, and generate a thumbnail.
 */
export async function saveUpload(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = nanoid(12);
  const filename = `${id}.webp`;

  // Full-size optimized image (max 1600px wide)
  await sharp(buffer)
    .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(UPLOAD_DIR, 'images', filename));

  // Thumbnail (400px wide)
  await sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 72 })
    .toFile(join(UPLOAD_DIR, 'thumbs', filename));

  return {
    path: `images/${filename}`,
    thumbPath: `thumbs/${filename}`,
  };
}

/**
 * Delete an uploaded image and its thumbnail.
 */
export function deleteUpload(path: string): void {
  const filename = path.replace('images/', '');
  const fullPath = join(UPLOAD_DIR, 'images', filename);
  const thumbPath = join(UPLOAD_DIR, 'thumbs', filename);
  if (existsSync(fullPath)) unlinkSync(fullPath);
  if (existsSync(thumbPath)) unlinkSync(thumbPath);
}

/**
 * Resolve an upload path to an absolute filesystem path.
 */
export function resolveUploadPath(relativePath: string): string {
  return join(UPLOAD_DIR, relativePath);
}
