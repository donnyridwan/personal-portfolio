import { expect, test, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { parseCloudinaryUrl, signParams, isAllowedFolder } = await import('../lib/cloudinary');

test('parseCloudinaryUrl membaca key, secret, dan cloud name', () => {
  expect(parseCloudinaryUrl('cloudinary://123456:abc-DEF_9@demo')).toEqual({
    apiKey: '123456', apiSecret: 'abc-DEF_9', cloudName: 'demo',
  });
  expect(() => parseCloudinaryUrl('')).toThrow();
  expect(() => parseCloudinaryUrl('https://example.com')).toThrow();
});

test('signParams sesuai contoh resmi Cloudinary', () => {
  expect(signParams(
    { timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' },
    'abcd',
  )).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
});

test('hanya folder dockfolio yang boleh ditandatangani', () => {
  expect(isAllowedFolder('dockfolio/profile')).toBe(true);
  expect(isAllowedFolder('dockfolio/desktop')).toBe(true);
  expect(isAllowedFolder('dockfolio/projects/archline')).toBe(true);
  expect(isAllowedFolder('dockfolio/projects/new')).toBe(true);
  expect(isAllowedFolder('dockfolio/projects/../x')).toBe(false);
  expect(isAllowedFolder('dockfolio/projects/')).toBe(false);
  expect(isAllowedFolder('lain')).toBe(false);
});

test('parseCloudinaryPdf mengenali PDF milik akun ini', async () => {
  const { parseCloudinaryPdf } = await import('../lib/cloudinary');
  expect(parseCloudinaryPdf('https://res.cloudinary.com/demo/image/upload/v123/dockfolio/profile/CV.pdf', 'demo'))
    .toEqual({ resourceType: 'image', publicId: 'dockfolio/profile/CV', version: '123' });
  expect(parseCloudinaryPdf('https://res.cloudinary.com/demo/raw/upload/a/b.pdf', 'demo'))
    .toEqual({ resourceType: 'raw', publicId: 'a/b', version: '' });
  expect(parseCloudinaryPdf('https://res.cloudinary.com/lain/image/upload/v1/x.pdf', 'demo')).toBeNull();
  expect(parseCloudinaryPdf('https://contoh.com/cv.pdf', 'demo')).toBeNull();
  expect(parseCloudinaryPdf('https://res.cloudinary.com/demo/image/upload/v1/x.png', 'demo')).toBeNull();
});
