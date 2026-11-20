import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAboutPage, prettyPhone } from '../public/about/about-render.js';

const data = {
  about: {
    name: 'Donny Ridwan Setiawan', headline: 'I design products people can actually finish using.', subtitle: 'Senior UI/UX.',
    stats: [{ value: '4+', unit: 'Yrs', label: 'Designing digital products' }, { value: '100%', label: 'Job Success Score' }],
    experience: [{ role: 'Senior Product Designer', company: 'Gandaria Studio', period: 'Feb 2024 – Present', summary: 'SaaS redesign.' }],
    testimonials: [],
  },
  contact: { email: 'halo@donnyridwan.my.id', links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/donnyrs/' }, { label: 'Phone', url: 'tel:+6285156019065' }] },
};

test('bagian utama tampil dengan data CV', () => {
  const h = renderAboutPage(data);
  assert.match(h, /I design products people can actually finish using\./);
  assert.match(h, /Numbers that hold up\./);
  assert.match(h, /4\+<small>Yrs<\/small>/);
  assert.match(h, /Gandaria Studio/);
  assert.match(h, /\+62 851-5601-9065/);
  assert.match(h, /mailto:halo@donnyridwan\.my\.id/);
  assert.match(h, /© Copyright Donny Ridwan Setiawan/);
});

test('testimoni kosong disembunyikan; Book a Call membuka Contact kalau tanpa link', () => {
  const h = renderAboutPage(data);
  assert.doesNotMatch(h, /ab-card/);
  assert.match(h, /data-ab-book/);
  const withLink = renderAboutPage({ ...data, about: { ...data.about, bookUrl: 'https://cal.com/donny' } });
  assert.match(withLink, /href="https:\/\/cal\.com\/donny"/);
});

test('teks di-escape dan link berbahaya diabaikan', () => {
  const h = renderAboutPage({ about: { headline: '<b>x</b>', bookUrl: 'javascript:alert(1)' }, contact: { links: [{ label: 'Bad', url: 'javascript:1' }] } });
  assert.match(h, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.doesNotMatch(h, /javascript:/);
});

test('prettyPhone', () => {
  assert.equal(prettyPhone('tel:+6285156019065'), '+62 851-5601-9065');
  assert.equal(prettyPhone('tel:+12025550123'), '+12025550123');
});
