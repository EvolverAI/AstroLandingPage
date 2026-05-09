/**
 * Netlify Function: contact-form
 * Handles POST requests from the contact form.
 * Sends email notification via the configured mail provider.
 *
 * Environment variables (set in Netlify dashboard):
 *   CONTACT_EMAIL     — recipient address (e.g. info@evolverai.ch)
 *   RESEND_API_KEY    — Resend.com API key (free tier: 3000 emails/month)
 */

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://evolverai.ch',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, message, subject = 'New contact form submission' } = body;

  // Basic validation
  if (!name || !email || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'name, email, and message are required' }),
    };
  }

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid email address' }),
    };
  }

  // Honeypot check (bot protection — if "website" field is filled, it's a bot)
  if (body.website) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const toEmail    = process.env.CONTACT_EMAIL || 'info@evolverai.ch';
  const resendKey  = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.error('RESEND_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Mail service not configured' }),
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EvolverAI Contact <noreply@evolverai.ch>',
        to: [toEmail],
        reply_to: email,
        subject: `[EvolverAI] ${subject}`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #3b82f6;padding-left:1rem;color:#475569;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <hr>
          <p style="color:#94a3b8;font-size:12px;">Sent from evolverai.ch contact form</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to send email' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Contact form error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
