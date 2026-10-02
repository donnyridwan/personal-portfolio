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

  const { password } = req.body || {};
  const expectedPassword = process.env.CMS_ADMIN_PASSWORD || process.env.VITE_CMS_ADMIN_PASSWORD || 'donny';

  if (!password || password !== expectedPassword) {
    return res.status(401).json({ success: false, error: 'Kata sandi tidak valid / Invalid password' });
  }

  // Simple token generation for session
  const token = Buffer.from(`cms_session_${Date.now()}_${expectedPassword}`).toString('base64');
  return res.status(200).json({ success: true, token, message: 'Authentication successful' });
}
