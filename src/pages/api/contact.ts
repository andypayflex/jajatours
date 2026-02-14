import type { APIRoute } from 'astro';
import { createContactSubmission } from '@db/queries/submissions.js';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const name = (form.get('name') as string)?.trim();
  const email = (form.get('email') as string)?.trim();

  if (!name || !email) {
    return new Response('Name and email are required.', { status: 400 });
  }

  // Honeypot check
  if (form.get('bot-field')) {
    return redirect('/');
  }

  createContactSubmission({
    name,
    email,
    interest: (form.get('interest') as string) || undefined,
    message: (form.get('message') as string) || undefined,
  });

  return redirect('/inquiry-success');
};
