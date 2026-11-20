// Asks for the preview password before anything is served (the browser's own sign-in box).
// The password is the PREVIEW_PASSWORD environment variable on the Vercel project, never in git.
// Without it set, every request is refused.
export const config = { matcher: '/:path*' };

function deny() {
  return new Response('This preview of life needs a password.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="life preview", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const expected = process.env.PREVIEW_PASSWORD;
  if (!expected) return deny();
  const [scheme, encoded] = (request.headers.get('authorization') || '').split(' ');
  if (scheme !== 'Basic' || !encoded) return deny();
  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return deny();
  }
  // Any user name is accepted; only the password matters.
  const password = decoded.slice(decoded.indexOf(':') + 1);
  return same(password, expected) ? undefined : deny();
}
