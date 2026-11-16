import { expect, test } from 'vitest';
import { buildDesktop, clampPos } from '../lib/desktop';
import { uniqueId, uniqueName } from '../lib/slug';
import type { DesktopRow } from '../lib/types';

const row = (o: Partial<DesktopRow>): DesktopRow => ({
  id: 'x', kind: 'photo', ref: '', label: '', src: '', x: null, y: null, mx: null, my: null, z: 0, ...o,
});
const projects = [{ id: 'glaze', name: 'Glaze', thumbnail: 'https://img/g.jpg' }];
const categories = [{ id: 'web', label: 'Website' }];

test('proyek & folder mengikuti nama dan gambar terbaru; ref yang hilang dibuang', () => {
  const out = buildDesktop([
    row({ id: 'a', kind: 'project', ref: 'glaze', x: 0.1, y: 0.2 }),
    row({ id: 'b', kind: 'project', ref: 'sudah-dihapus' }),
    row({ id: 'c', kind: 'folder', ref: 'web' }),
    row({ id: 'd', kind: 'folder', ref: 'hilang' }),
  ], projects, categories, '');
  expect(out.map(i => i.id)).toEqual(['a', 'c']);
  expect(out[0]).toMatchObject({ label: 'Glaze', img: 'https://img/g.jpg', x: 0.1, y: 0.2, mx: null });
  expect(out[1]).toMatchObject({ label: 'Website', kind: 'folder' });
});

test('file resume memakai URL resume dari profil', () => {
  const [r] = buildDesktop([row({ id: 'r', kind: 'file', ref: 'resume', label: 'resume.pdf' })], [], [], 'https://cdn/cv.pdf');
  expect(r).toMatchObject({ label: 'resume.pdf', src: 'https://cdn/cv.pdf' });
});

test('foto memakai src sebagai gambar; app & file biasa apa adanya', () => {
  const out = buildDesktop([
    row({ id: 'p', kind: 'photo', label: 'pantai.jpg', src: 'https://c/p.jpg' }),
    row({ id: 'f', kind: 'file', label: 'cv.pdf', src: 'https://c/cv.pdf' }),
    row({ id: 'm', kind: 'app', ref: 'framer-x-container', label: 'Music' }),
  ], [], [], '');
  expect(out.map(i => [i.kind, i.label, i.img, i.src])).toEqual([
    ['photo', 'pantai.jpg', 'https://c/p.jpg', 'https://c/p.jpg'],
    ['file', 'cv.pdf', '', 'https://c/cv.pdf'],
    ['app', 'Music', '', ''],
  ]);
});

test('urutan tumpukan mengikuti z', () => {
  const out = buildDesktop([row({ id: 'atas', z: 5 }), row({ id: 'bawah', z: 1 })], [], [], '');
  expect(out.map(i => i.id)).toEqual(['bawah', 'atas']);
});

test('clampPos menjaga posisi di dalam layar dan menolak nilai rusak', () => {
  expect(clampPos(0.5)).toBe(0.5);
  expect(clampPos(-1)).toBe(0);
  expect(clampPos(3)).toBe(1);
  expect(clampPos(Number.NaN)).toBeNull();
  expect(clampPos('0.3')).toBeNull();
  expect(clampPos(null)).toBeNull();
});

test('uniqueName menambah angka seperti Finder', () => {
  expect(uniqueName('Folder Baru', [])).toBe('Folder Baru');
  expect(uniqueName('Folder Baru', ['Folder Baru'])).toBe('Folder Baru 2');
  expect(uniqueName('Folder Baru', ['folder baru', 'Folder Baru 2'])).toBe('Folder Baru 3');
});

test('uniqueId menambah -2, -3 kalau id sudah dipakai', () => {
  expect(uniqueId('glaze', [])).toBe('glaze');
  expect(uniqueId('glaze', ['glaze', 'glaze-2'])).toBe('glaze-3');
});
