import { signSignedToken, verifySignedToken } from '@/lib/contentful/signed-token';

export type PreviewTokenPayload = {
  locale: string;
  slug: string;
  exp: number;
  release?: string;
  timestamp?: string;
};

function isPreviewTokenPayload(value: unknown): value is PreviewTokenPayload {
  if (value == null || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.locale !== 'string' || typeof p.slug !== 'string' || typeof p.exp !== 'number') {
    return false;
  }
  if (p.release !== undefined && typeof p.release !== 'string') return false;
  if (p.timestamp !== undefined && typeof p.timestamp !== 'string') return false;
  return true;
}

export function signPreviewToken(payload: PreviewTokenPayload, secret: string): string {
  return signSignedToken(payload, secret);
}

export function verifyPreviewToken(token: string, secret: string): PreviewTokenPayload | null {
  return verifySignedToken(token, secret, isPreviewTokenPayload);
}
