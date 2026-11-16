import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { demoAnswer } from '../lib/ai-demo';

const data = JSON.parse(readFileSync(new URL('../public/finder/finder-data.json', import.meta.url), 'utf8'));

test('siapa → nama dan peran', () => {
  const a = demoAnswer('Siapa David?', data);
  expect(a).toContain('David Tran');
  expect(a).toContain('Senior Product Designer');
});

test('proyek → daftar proyek, terbaru dulu', () => {
  const a = demoAnswer('Proyek apa saja yang pernah dikerjakan?', data);
  for (const n of ['Archline', 'Glaze', 'BRND™']) expect(a).toContain(n);
  expect(a.indexOf('Glaze')).toBeLessThan(a.indexOf('Creatory')); // 2026 sebelum 2023
});

test('nama proyek tertentu → ringkasannya', () => {
  const a = demoAnswer('ceritain soal nexmind dong', data);
  expect(a).toContain('Nexmind');
  expect(a).toContain('dark-mode website');
});

test('kontak → link kontak', () => {
  const a = demoAnswer('Bagaimana cara menghubungi David?', data);
  expect(a).toContain('https://www.linkedin.com/');
});

test('skill → tag dari proyek', () => {
  expect(demoAnswer('skill nya apa aja?', data)).toContain('Web Design');
});

test('bahasa Inggris dijawab bahasa Inggris', () => {
  expect(demoAnswer('Who is he?', data)).toMatch(/is a|works as/i);
  expect(demoAnswer('How can I contact him?', data)).toMatch(/reach/i);
});

test('pertanyaan lain → penjelasan mode demo + saran', () => {
  const a = demoAnswer('berapa tinggi badannya?', data);
  expect(a).toMatch(/mode demo/i);
});
