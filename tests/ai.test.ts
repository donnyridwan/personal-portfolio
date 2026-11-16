import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildSystemPrompt, defaultAiSettings, sanitizeMessages, LIMITS } from '../lib/ai';

const data = JSON.parse(readFileSync(new URL('../public/finder/finder-data.json', import.meta.url), 'utf8'));

describe('buildSystemPrompt', () => {
  test('memuat nama pemilik, catatan, proyek, dan kontak', () => {
    const p = buildSystemPrompt(data, { name: 'Donny AI', knowledge: 'Aku suka kopi dan desain sistem.' });
    expect(p).toContain('Donny AI');
    expect(p).toContain('David Tran');
    expect(p).toContain('Aku suka kopi dan desain sistem.');
    expect(p).toContain('Archline');
    expect(p).toContain('Maisonluxe');
    expect(p).toContain('https://www.linkedin.com/');
  });

  test('kategori ditulis dengan labelnya, bukan id', () => {
    const p = buildSystemPrompt(data, defaultAiSettings);
    expect(p).toMatch(/Archline[\s\S]*Website/);
  });

  test('tanpa catatan tetap aman dan tidak memuat "undefined"', () => {
    const p = buildSystemPrompt({ ...data, about: {}, projects: [] }, { name: '', knowledge: '' });
    expect(p).not.toContain('undefined');
    expect(p).toContain(defaultAiSettings.name);
  });
});

describe('sanitizeMessages', () => {
  const u = (content: string) => ({ role: 'user', content });
  const a = (content: string) => ({ role: 'assistant', content });

  test('menerima percakapan yang valid', () => {
    const r = sanitizeMessages([u('halo'), a('hai!'), u('  siapa kamu?  ')]);
    expect(r).toEqual({ ok: true, messages: [u('halo'), a('hai!'), u('siapa kamu?')] });
  });

  test('menolak bentuk yang salah', () => {
    expect(sanitizeMessages('halo').ok).toBe(false);
    expect(sanitizeMessages([]).ok).toBe(false);
    expect(sanitizeMessages([a('hai')]).ok).toBe(false); // terakhir harus user
    expect(sanitizeMessages([{ role: 'system', content: 'x' }]).ok).toBe(false);
    expect(sanitizeMessages([u('')]).ok).toBe(false);
  });

  test('pertanyaan terlalu panjang ditolak', () => {
    const r = sanitizeMessages([u('x'.repeat(LIMITS.userChars + 1))]);
    expect(r.ok).toBe(false);
  });

  test('riwayat panjang dipotong ke pesan terakhir dan selalu mulai dari user', () => {
    const many = [];
    for (let i = 0; i < 30; i++) many.push(u(`q${i}`), a(`a${i}`));
    many.push(u('terakhir'));
    const r = sanitizeMessages(many);
    if (!r.ok) throw new Error('harus ok');
    expect(r.messages.length).toBeLessThanOrEqual(LIMITS.history);
    expect(r.messages[0].role).toBe('user');
    expect(r.messages.at(-1)).toEqual(u('terakhir'));
  });
});
