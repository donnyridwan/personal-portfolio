import { expect, test } from 'vitest';
import { parseContact } from '../lib/contact';

test('mengambil nama, email, pesan dari isian Framer', () => {
  expect(parseContact([['Name', 'Budi'], ['Email', 'budi@mail.com'], ['Message', 'Halo!'], ['__framer_0', '[]']])).toEqual({
    name: 'Budi', email: 'budi@mail.com', message: 'Halo!',
    fields: { Name: 'Budi', Email: 'budi@mail.com', Message: 'Halo!' },
  });
});

test('menolak kosong, email salah, dan isian kebanyakan/kepanjangan', () => {
  expect(parseContact([['Name', 'X']])).toBeNull();
  expect(parseContact([['Email', 'bukan-email'], ['Message', 'hai']])).toBeNull();
  expect(parseContact([['Message', 'x'.repeat(6000)]])).toBeNull();
  expect(parseContact(Array.from({ length: 30 }, (_, i) => [`f${i}`, 'x'] as [string, string]))).toBeNull();
});
