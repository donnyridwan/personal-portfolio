import { expect, test } from 'vitest';
import { slugify } from '../lib/slug';

test('slugify membuat id aman dari nama', () => {
  expect(slugify('BRND™')).toBe('brnd');
  expect(slugify('Nexmind®')).toBe('nexmind');
  expect(slugify('Café  Ünïcode')).toBe('cafe-unicode');
  expect(slugify('Hello, World!')).toBe('hello-world');
  expect(slugify('  --Mobile App--  ')).toBe('mobile-app');
  expect(slugify('')).toBe('proyek');
  expect(slugify('™®')).toBe('proyek');
});
