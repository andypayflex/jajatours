import type { APIRoute } from 'astro';
import { deleteSession } from '@db/queries/sessions.js';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = cookies.get('session')?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }
  cookies.delete('session', { path: '/' });
  return redirect('/admin/login');
};
