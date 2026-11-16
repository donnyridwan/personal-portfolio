import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('redirect'); } }));

const { sha256Hex, isValidToken, checkPassword, expectedToken } = await import('../lib/auth');

afterEach(() => vi.unstubAllEnvs());

describe('auth', () => {
  test('sha256Hex sesuai nilai SHA-256 standar', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  test('token dari password yang benar diterima, lainnya ditolak', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'rahasia');
    expect(await isValidToken(await sha256Hex('rahasia'))).toBe(true);
    expect(await isValidToken(await sha256Hex('salah'))).toBe(false);
    expect(await isValidToken('')).toBe(false);
    expect(await isValidToken(undefined)).toBe(false);
    expect(await checkPassword('rahasia')).toBe(true);
    expect(await checkPassword('Rahasia')).toBe(false);
  });

  test('ADMIN_PASSWORD kosong: tidak ada yang bisa masuk', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(await expectedToken()).toBeNull();
    expect(await checkPassword('')).toBe(false);
    expect(await isValidToken(await sha256Hex(''))).toBe(false);
  });
});
