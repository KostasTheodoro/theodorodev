import type { APIRoute } from 'astro';
import { siteContact } from '@/lib/site';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 2000;

// Response contract consumed by src/components/ContactForm.tsx — keep both in sync.
type ContactResponse = { ok: true } | { ok: false; error: string };

function json(body: ContactResponse, status: number) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const POST: APIRoute = async ({ request }) => {
	let payload: { name?: unknown; email?: unknown; message?: unknown };
	try {
		payload = await request.json();
	} catch {
		return json({ ok: false, error: 'Please fill in all fields with a valid email.' }, 400);
	}

	const name = typeof payload.name === 'string' ? payload.name.trim() : '';
	const email = typeof payload.email === 'string' ? payload.email.trim() : '';
	const message = typeof payload.message === 'string' ? payload.message.trim() : '';

	if (
		!name ||
		!email ||
		!message ||
		name.length > MAX_LENGTH ||
		email.length > MAX_LENGTH ||
		message.length > MAX_LENGTH ||
		!EMAIL_RE.test(email)
	) {
		return json({ ok: false, error: 'Please fill in all fields with a valid email.' }, 400);
	}

	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		// Expected, routine state until Resend is configured with a verified domain — not a bug.
		return json(
			{
				ok: false,
				error: `The contact form isn't wired up to send email yet — please reach out at ${siteContact.email} for now.`,
			},
			503,
		);
	}

	// Sandbox sender until theodorodev.com is verified with Resend — swap RESEND_FROM_EMAIL once it is.
	const from = import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from,
				to: siteContact.email,
				reply_to: email,
				subject: `New message from ${name} via theodorodev.com`,
				text: `From: ${name} <${email}>\n\n${message}`,
			}),
		});

		if (!response.ok) {
			return json(
				{ ok: false, error: 'Something went wrong sending your message — please try again or email me directly.' },
				502,
			);
		}

		return json({ ok: true }, 200);
	} catch {
		return json(
			{ ok: false, error: 'Something went wrong sending your message — please try again or email me directly.' },
			502,
		);
	}
};
