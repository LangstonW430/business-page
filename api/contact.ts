import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, business, plan, message } = req.body as {
    name?: string;
    email?: string;
    business?: string;
    plan?: string;
    message?: string;
  };

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const to = process.env.CONTACT_EMAIL_TO ?? 'langstonw430@gmail.com';

  try {
    const { error } = await resend.emails.send({
      from: 'Langston Woods Site <automation@langstonwoods.com>',
      to,
      replyTo: email,
      subject: `New website inquiry — ${name}`,
      html: `
        <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f0e8; padding: 48px 40px; color: #1a1410;">
          <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c4500a; margin: 0 0 24px;">New Inquiry · langstonwoods.com</p>
          <h2 style="font-family: Georgia, serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 32px; line-height: 1.1;">${name}</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1); width: 120px; vertical-align: top;">Email</td>
              <td style="font-size: 14px; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1);"><a href="mailto:${email}" style="color: #c4500a;">${email}</a></td>
            </tr>
            ${business ? `
            <tr>
              <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1); vertical-align: top;">Business</td>
              <td style="font-size: 14px; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1);">${business}</td>
            </tr>` : ''}
            ${plan ? `
            <tr>
              <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1); vertical-align: top;">Plan</td>
              <td style="font-size: 14px; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1);">${plan}</td>
            </tr>` : ''}
            ${message ? `
            <tr>
              <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b7355; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1); vertical-align: top;">Message</td>
              <td style="font-size: 14px; padding: 12px 0; border-top: 1px solid rgba(26,20,16,0.1); line-height: 1.7; color: #3a3028;">${message.replace(/\n/g, '<br />')}</td>
            </tr>` : ''}
          </table>

          <div style="margin-top: 40px; padding-top: 24px; border-top: 3px solid #c4500a;">
            <a href="mailto:${email}" style="display: inline-block; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; background: #c4500a; color: #f5f0e8; padding: 12px 24px; text-decoration: none;">Reply to ${name}</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Unexpected error:', message);
    return res.status(500).json({ error: message });
  }
}
