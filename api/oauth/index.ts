import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID env var not set');
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
    redirect_uri: `${process.env.SITE_URL ?? ''}/api/oauth/callback`,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
