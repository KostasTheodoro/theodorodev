import type { APIRoute } from 'astro';
import { siteContact } from '@/lib/site';
import { ui, defaultLang, type Lang } from '@/i18n/ui';

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
	let payload: {
		firstName?: unknown;
		lastName?: unknown;
		phone?: unknown;
		email?: unknown;
		message?: unknown;
		lang?: unknown;
	};
	try {
		payload = await request.json();
	} catch {
		// lang isn't known yet since the body failed to parse — malformed body isn't a normal visitor path.
		return json({ ok: false, error: ui[defaultLang]['form.validationError'] }, 400);
	}

	const lang: Lang = payload.lang === 'el' ? 'el' : defaultLang;

	const firstName = typeof payload.firstName === 'string' ? payload.firstName.trim() : '';
	const lastName = typeof payload.lastName === 'string' ? payload.lastName.trim() : '';
	const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
	const email = typeof payload.email === 'string' ? payload.email.trim() : '';
	const message = typeof payload.message === 'string' ? payload.message.trim() : '';

	if (
		!firstName ||
		!lastName ||
		!email ||
		!message ||
		firstName.length > MAX_LENGTH ||
		lastName.length > MAX_LENGTH ||
		phone.length > MAX_LENGTH ||
		email.length > MAX_LENGTH ||
		message.length > MAX_LENGTH ||
		!EMAIL_RE.test(email)
	) {
		return json({ ok: false, error: ui[lang]['form.validationError'] }, 400);
	}

	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		// Expected, routine state until Resend is configured with a verified domain — not a bug.
		return json(
			{
				ok: false,
				error: ui[lang]['form.notConfigured'].replace('{{email}}', siteContact.email),
			},
			503,
		);
	}

	// Sandbox sender until theodorodev.com is verified with Resend — swap RESEND_FROM_EMAIL once it is.
	const from = import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

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
				subject: `New message from ${firstName} ${lastName} via theodorodev.com`,
				text: `From: ${firstName} ${lastName} <${email}>\n${phone ? `Phone: ${phone}\n` : ''}\n${message}`,
			}),
			signal: controller.signal,
		});

		if (!response.ok) {
			console.error('Resend request failed', response.status, await response.text());
			return json({ ok: false, error: ui[lang]['form.fallbackError'] }, 502);
		}

		return json({ ok: true }, 200);
	} catch (error) {
		console.error('Resend request failed or timed out', error);
		return json({ ok: false, error: ui[lang]['form.fallbackError'] }, 502);
	} finally {
		clearTimeout(timeout);
	}
};
