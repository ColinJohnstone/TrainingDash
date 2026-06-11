// Shared auth helper for the serverless functions. Single-user password gate:
// a valid login sets a signed httpOnly cookie; protected endpoints require it.
//
// Env vars (set in Vercel + .env.local):
//   APP_PASSWORD  — the password you type to log in
//   AUTH_SECRET   — a long random string used to sign the cookie
//
// If neither is set, the gate is OPEN (so deploying this code can't lock you out
// before the env vars exist). Once both are set, the gate is enforced.

const COOKIE_NAME = 'td_auth';
const MESSAGE = 'authenticated-v1';

export function authConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD && process.env.AUTH_SECRET);
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export function makeToken(secret: string): Promise<string> {
  return hmac(secret, MESSAGE);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

// Whether the request carries a valid session (or auth isn't configured yet).
export async function isAuthed(req: Request): Promise<boolean> {
  if (!authConfigured()) return true;
  const token = readCookie(req, COOKIE_NAME);
  if (!token) return false;
  const expected = await makeToken(process.env.AUTH_SECRET as string);
  return timingSafeEqual(token, expected);
}

function isSecure(req: Request): boolean {
  if (req.headers.get('x-forwarded-proto') === 'https') return true;
  try {
    return new URL(req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function sessionCookie(req: Request, token: string): string {
  const secure = isSecure(req) ? ' Secure;' : '';
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie(req: Request): string {
  const secure = isSecure(req) ? ' Secure;' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}
