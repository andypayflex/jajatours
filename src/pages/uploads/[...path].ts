import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'node:fs';
import { resolveUploadPath } from '../../db/uploads.js';

export const GET: APIRoute = async ({ params }) => {
  const filePath = params.path;
  if (!filePath) {
    return new Response('Not found', { status: 404 });
  }

  // Prevent directory traversal
  if (filePath.includes('..')) {
    return new Response('Forbidden', { status: 403 });
  }

  const absolutePath = resolveUploadPath(filePath);
  if (!existsSync(absolutePath)) {
    return new Response('Not found', { status: 404 });
  }

  const file = readFileSync(absolutePath);

  // Determine content type from extension
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  };

  return new Response(file, {
    headers: {
      'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
