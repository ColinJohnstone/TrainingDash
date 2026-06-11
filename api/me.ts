// GET /api/me  → 200 { authed:true, configured } if logged in (or auth not
// configured), else 401. Used by the frontend gate to decide login vs app.

import { authConfigured, isAuthed } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const authed = await isAuthed(req);
  return new Response(
    JSON.stringify({ authed, configured: authConfigured() }),
    {
      status: authed ? 200 : 401,
      headers: { 'content-type': 'application/json' },
    },
  );
}
