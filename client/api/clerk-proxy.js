export default async function handler(req, res) {
  try {
    // Get the clerk path from query param (set by vercel.json rewrite)
    const clerkPath = req.query.path || '/';

    // Build the target URL to Clerk's Frontend API
    const targetUrl = new URL(
      `https://frontend-api.clerk.dev${clerkPath.startsWith('/') ? '' : '/'}${clerkPath}`
    );

    // Copy over query params (except our internal 'path' param)
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'path') {
        targetUrl.searchParams.set(key, value);
      }
    }

    // Read the raw request body
    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    // Build forwarded headers (exclude hop-by-hop headers)
    const skipHeaders = new Set([
      'host', 'connection', 'transfer-encoding', 'keep-alive',
      'upgrade', 'proxy-connection', 'te', 'trailer'
    ]);

    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!skipHeaders.has(key.toLowerCase())) {
        forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    // Add the three required Clerk proxy headers
    forwardHeaders['Clerk-Proxy-Url'] = 'https://quick-ai-gray.vercel.app/__clerk';
    forwardHeaders['Clerk-Secret-Key'] = process.env.CLERK_SECRET_KEY;
    forwardHeaders['X-Forwarded-For'] =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Make the proxied request to Clerk
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });

    // Forward response status
    res.status(response.status);

    // Forward response headers (exclude problematic ones)
    const skipResponseHeaders = new Set([
      'transfer-encoding', 'connection', 'content-encoding'
    ]);
    for (const [key, value] of response.headers.entries()) {
      if (!skipResponseHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Forward response body
    const responseBody = Buffer.from(await response.arrayBuffer());
    res.send(responseBody);

  } catch (error) {
    console.error('Clerk proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
