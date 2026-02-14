/**
 * Returns the URL for an uploaded image.
 * Replaces Sanity's urlForImage() helper.
 */
export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  // If already an absolute URL (external), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Local uploads are served from /uploads/
  return path.startsWith('/') ? path : `/uploads/${path}`;
}
