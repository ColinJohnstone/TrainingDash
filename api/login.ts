// POST /api/login  { password }  → sets the session cookie on success.

import { authConfigured, makeToken, sessionCookie } from '../lib/auth';

export const config = { runtime: 'edge' };

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  // Nothing to log in to yet — treat as already open.
  if (!authConfigured()) return json({ ok: true });

  let password = '';
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? '';
  } catch {
    return json({ error: 'invalid body' }, 400);
  }

  if (password !== process.env.APP_PASSWORD) {
    return json({ error: 'invalid password' }, 401);
  }

  const token = await makeToken(process.env.AUTH_SECRET as string);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(req, token) });
}
