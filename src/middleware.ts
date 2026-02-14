import { defineMiddleware } from 'astro:middleware';
import { validateSession } from '@db/queries/sessions.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect all /admin routes except /admin/login
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath.startsWith('/admin') && cleanPath !== '/admin/login') {
    const sessionId = context.cookies.get('session')?.value;
    if (!sessionId || !validateSession(sessionId)) {
      return context.redirect('/admin/login');
    }
  }

  const response = await next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});
