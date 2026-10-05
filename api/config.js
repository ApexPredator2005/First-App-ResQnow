// Vercel Serverless Function
// Securely proxies the Google Maps API Key from environment variables to the frontend
// Route: GET /api/config → returns { apiKey, status }
module.exports = function handler(req, res) {
  // Enforce GET method only
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const origin = req.headers.origin || "";
  const host = req.headers.host || "";
  
  // Strict CORS Policy
  let allowedOrigin = host ? `https://${host}` : "*";
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      const isLocal = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
      const isHostMatch = host && (parsedOrigin.host === host);
      const isVercelDeploy = parsedOrigin.hostname.endsWith('.vercel.app');

      if (isLocal || isHostMatch || isVercelDeploy) {
        allowedOrigin = origin;
      }
    } catch (e) {
      // Keep default allowedOrigin on malformed URL
    }
  }
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GMP_API_KEY || "";

  return res.status(200).json({
    apiKey: apiKey,
    status: apiKey ? "configured" : "unconfigured"
  });
};
