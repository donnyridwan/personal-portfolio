import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutFor, savedPos, placeAll, CELL, toFraction, kindForFile } from '../public/desktop/desktop-model.js';

test('layout HP di bawah 810 px', () => {
  assert.equal(layoutFor(390), 'm');
  assert.equal(layoutFor(809), 'm');
  assert.equal(layoutFor(810), 'd');
  assert.equal(layoutFor(1440), 'd');
});

test('savedPos memilih kolom sesuai layout', () => {
  const it = { x: 0.1, y: 0.2, mx: null, my: null };
  assert.deepEqual(savedPos(it, 'd'), { x: 0.1, y: 0.2 });
  assert.equal(savedPos(it, 'm'), null);
});

test('ikon tanpa posisi ditaruh dari kanan atas, tidak menimpa ikon lain', () => {
  const W = 1040, H = 800;
  const items = [
    { id: 'ada', x: (9.5 * CELL.w) / W, y: (40 + 0.5 * CELL.h) / H }, // sel kanan atas sudah terisi
    { id: 'baru1', x: null, y: null },
    { id: 'baru2', x: null, y: null },
  ];
  const pos = placeAll(items, 'd', W, H);
  assert.deepEqual(pos.get('ada'), { x: items[0].x, y: items[0].y });
  const cell = p => [Math.floor((p.x * W) / CELL.w), Math.floor((p.y * H - 40) / CELL.h)];
  assert.deepEqual(cell(pos.get('baru1')), [9, 1]);
  assert.deepEqual(cell(pos.get('baru2')), [9, 2]);
});

test('toFraction dijaga 0–1', () => {
  assert.equal(toFraction(50, 100), 0.5);
  assert.equal(toFraction(-5, 100), 0);
  assert.equal(toFraction(500, 100), 1);
});

test('kindForFile: gambar → foto, PDF → file, lainnya ditolak', () => {
  assert.equal(kindForFile('image/png'), 'photo');
  assert.equal(kindForFile('application/pdf'), 'file');
  assert.equal(kindForFile('video/mp4'), null);
});
