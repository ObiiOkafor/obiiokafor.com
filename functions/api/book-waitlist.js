const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

async function verifyTurnstile(token, secret, ip) {
  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.success);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendWelcomeEmail(env, email, firstName) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { skipped: true };
  }

  const displayName = firstName ? firstName.trim() : 'there';
  const safeDisplayName = escapeHtml(displayName);
  const linkedInUrl = 'https://www.linkedin.com/in/obiageli-okafor';
  const welcomeText = `Hi ${displayName},

Thank you for joining the waitlist for Impossible to Ignore. I'm so glad you're here.

This book has been an honest answer to a question I get frequently asked: "How do I become more professionally visible?" and I'm excited to share it with you. As a waitlist member, you'll get exclusive updates and be among the first to know when the book is available.

In the meantime, let's stay connected on LinkedIn (@Obiageli (obii) Okafor). I regularly share practical insights on product management, career growth, leadership and building a career that stands out.

Thank you again for being part of this journey. I genuinely appreciate your support, and I can't wait to share this book with you.

Warmly,
Obii Okafor.`;

  const welcomeHtml = `
        <p>Hi ${safeDisplayName},</p>
        <p>Thank you for joining the waitlist for <strong>Impossible to Ignore</strong>. I'm so glad you're here.</p>
        <p>This book has been an honest answer to a question I get frequently asked: &quot;How do I become more professionally visible?&quot; and I'm excited to share it with you. As a waitlist member, you'll get exclusive updates and be among the first to know when the book is available.</p>
        <p>In the meantime, let's stay connected on <a href="${linkedInUrl}">LinkedIn (@Obiageli (obii) Okafor)</a>. I regularly share practical insights on product management, career growth, leadership and building a career that stands out.</p>
        <p>Thank you again for being part of this journey. I genuinely appreciate your support, and I can't wait to share <em>this book</em> with you.</p>
        <p>Warmly,<br /><strong>Obii Okafor.</strong></p>
      `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [email],
      subject: "You're on the waitlist",
      text: welcomeText,
      html: welcomeHtml
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('Resend welcome email failed:', errorText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return json({ error: 'Database binding is missing.' }, 500);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Spam protection is not configured yet.' }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const email = String(payload.email || '').trim();
  const firstName = String(payload.first_name || '').trim();
  const company = String(payload.company || '').trim();
  const sourcePage = String(payload.source_page || '').trim() || '/book';
  const turnstileToken = String(payload.turnstileToken || '').trim();

  if (company) {
    return json({ message: 'Thanks for joining the waitlist.' }, 200);
  }

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  if (firstName.length > 80) {
    return json({ error: 'First name is too long.' }, 400);
  }

  if (!turnstileToken) {
    return json({ error: 'Please complete the spam check.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP');
  const turnstileOk = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
  if (!turnstileOk) {
    return json({ error: 'Spam check failed. Please try again.' }, 400);
  }

  const normalizedEmail = email.toLowerCase();
  const now = new Date().toISOString();

  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM book_waitlist WHERE email_normalized = ? LIMIT 1'
    ).bind(normalizedEmail).first();

    if (existing) {
      return json({
        ok: true,
        duplicate: true,
        message: "You're already on the waitlist. I'll be in touch when the book is ready."
      });
    }

    await env.DB.prepare(
      'INSERT INTO book_waitlist (email, email_normalized, first_name, source_page, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(email, normalizedEmail, firstName || null, sourcePage, now).run();

    await sendWelcomeEmail(env, email, firstName);

    return json({
      ok: true,
      duplicate: false,
      message: 'You are on the waitlist now. Thank you for joining me early.'
    });
  } catch (error) {
    console.error('Book waitlist failure', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
