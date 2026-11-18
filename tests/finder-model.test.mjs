import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateData, getProject, projectsInCategory, featuredProjects, createHistory,
  parseViewPrefs, DEFAULT_VIEW_PREFS,
} from '../public/finder/finder-model.js';

const data = JSON.parse(readFileSync(new URL('../public/finder/finder-data.json', import.meta.url), 'utf8'));

test('data asli valid', () => assert.deepEqual(validateData(data), []));

test('website berisi 4 proyek urut', () =>
  assert.deepEqual(projectsInCategory(data, 'website').map(p => p.id), ['archline', 'dewi', 'nonsence', 'creatory']));

test('mobile-app kosong', () => assert.deepEqual(projectsInCategory(data, 'mobile-app'), []));

test('getProject mengembalikan null untuk id tak dikenal', () => {
  assert.equal(getProject(data, 'glaze').name, 'Glaze');
  assert.equal(getProject(data, 'nope'), null);
});

test('featured urut dengan warna', () =>
  assert.deepEqual(featuredProjects(data).map(f => [f.project.id, f.color]),
    [['archline', '#ff5f57'], ['nexmind', '#febc2e'], ['glaze', '#28c840']]));

test('featured id tak dikenal dilewati', () => {
  const d = structuredClone(data);
  d.featured.push({ projectId: 'nope', color: '#000' });
  assert.equal(featuredProjects(d).length, 3);
});

test('validateData melaporkan kategori tak dikenal dan featured rusak', () => {
  const d = structuredClone(data);
  d.projects[0].categories = ['xyz'];
  d.featured.push({ projectId: 'nope', color: '#000' });
  const errs = validateData(d);
  assert.ok(errs.some(e => e.includes('xyz')));
  assert.ok(errs.some(e => e.includes('nope')));
});

test('history mundur dan maju', () => {
  const h = createHistory({ type: 'category', id: 'website' });
  assert.equal(h.canBack(), false);
  h.push({ type: 'project', id: 'dewi' });
  assert.equal(h.canBack(), true);
  assert.deepEqual(h.back(), { type: 'category', id: 'website' });
  assert.equal(h.canForward(), true);
  assert.deepEqual(h.forward(), { type: 'project', id: 'dewi' });
  h.back();
  h.push({ type: 'about' });
  assert.equal(h.canForward(), false);
  assert.deepEqual(h.current(), { type: 'about' });
});

test('pilihan tampilan default: grid, ukuran sedang', () =>
  assert.deepEqual(DEFAULT_VIEW_PREFS, { mode: 'grid', gridSize: 'medium' }));

test('parseViewPrefs membaca pilihan tersimpan yang valid', () =>
  assert.deepEqual(parseViewPrefs('{"mode":"grid","gridSize":"large"}'), { mode: 'grid', gridSize: 'large' }));

test('parseViewPrefs memakai default untuk nilai rusak atau tak dikenal', () => {
  assert.deepEqual(parseViewPrefs(null), DEFAULT_VIEW_PREFS);
  assert.deepEqual(parseViewPrefs('bukan json'), DEFAULT_VIEW_PREFS);
  assert.deepEqual(parseViewPrefs('{"mode":"cover","gridSize":"huge"}'), DEFAULT_VIEW_PREFS);
  assert.deepEqual(parseViewPrefs('{"mode":"list"}'), { mode: 'list', gridSize: 'medium' });
});
