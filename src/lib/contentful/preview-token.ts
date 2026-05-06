import { createHmac, timingSafeEqual } from 'node:crypto';

export type PreviewTokenPayload = {
  locale: string;
  slug: string;
  exp: number;
};

export function signPreviewToken(payload: PreviewTokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyPreviewToken(token: string, secret: string): PreviewTokenPayload | null {
  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  const expectedSig = createHmac('sha256', secret).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const json = Buffer.from(body, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as PreviewTokenPayload;
    if (
      typeof payload.locale !== 'string' ||
      typeof payload.slug !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
