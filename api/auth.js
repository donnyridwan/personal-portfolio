import { checkPassword, issueToken } from './_lib/cmsToken.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!process.env.CMS_ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, error: 'CMS_ADMIN_PASSWORD is not configured on the server' });
  }

  const { password } = req.body || {};

  if (!checkPassword(password)) {
    return res.status(401).json({ success: false, error: 'Kata sandi tidak valid / Invalid password' });
  }

  // Signed, expiring session token (verified by /api/portfolio on writes)
  const token = issueToken();
  return res.status(200).json({ success: true, token, message: 'Authentication successful' });
}
