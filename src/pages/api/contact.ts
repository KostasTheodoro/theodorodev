import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { siteContact } from '@/lib/site';
import { ui, defaultLang, type Lang } from '@/i18n/ui';
import { getContactEmailConfig } from '@/lib/email/config';
import { renderContactEmailHtml, renderContactEmailText } from '@/lib/email/template';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_TIMEOUT_MS = 10_000;

type FieldName = 'firstName' | 'lastName' | 'email' | 'phone' | 'message';

// Response contract consumed by src/components/ContactForm.tsx — keep both in sync.
type ContactResponse =
	| { success: true; message: string }
	| { success: false; message: string; errors?: Partial<Record<FieldName, string>> };

function json(body: ContactResponse, status: number) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function containsNewline(value: string): boolean {
	return /[\r\n]/.test(value);
}

export const POST: APIRoute = async ({ request }) => {
	let payload: {
		firstName?: unknown;
		lastName?: unknown;
		phone?: unknown;
		email?: unknown;
		message?: unknown;
		website?: unknown; // honeypot — real visitors never fill this
		lang?: unknown;
	};
	try {
		payload = await request.json();
	} catch {
		// lang isn't known yet since the body failed to parse — malformed body isn't a normal visitor path.
		return json({ success: false, message: ui[defaultLang]['form.validationError'] }, 400);
	}

	const lang: Lang = payload.lang === 'el' ? 'el' : defaultLang;
	const t = ui[lang];

	// Bots that blindly fill every field trip this. Respond as if the message
	// was sent so the trap isn't revealed, but skip sending entirely.
	if (typeof payload.website === 'string' && payload.website.trim() !== '') {
		return json({ success: true, message: t['form.successToast'] }, 200);
	}

	const firstName = typeof payload.firstName === 'string' ? payload.firstName.trim() : '';
	const lastName = typeof payload.lastName === 'string' ? payload.lastName.trim() : '';
	const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
	const email = typeof payload.email === 'string' ? payload.email.trim() : '';
	const message = typeof payload.message === 'string' ? payload.message.trim() : '';

	const errors: Partial<Record<FieldName, string>> = {};
	if (firstName.length < 2 || firstName.length > 100 || containsNewline(firstName)) {
		errors.firstName = t['form.required'];
	}
	if (lastName.length < 2 || lastName.length > 100 || containsNewline(lastName)) {
		errors.lastName = t['form.required'];
	}
	if (!email || email.length > 254 || containsNewline(email) || !EMAIL_RE.test(email)) {
		errors.email = t['form.invalidEmail'];
	}
	if (message.length < 10 || message.length > 5000) {
		errors.message = t['form.required'];
	}
	if (phone.length > 32 || containsNewline(phone)) {
		errors.phone = t['form.validationError'];
	}

	if (Object.keys(errors).length > 0) {
		return json({ success: false, message: t['form.validationError'], errors }, 400);
	}

	const configResult = getContactEmailConfig();
	if (!configResult.ok) {
		if (configResult.reason === 'not_configured') {
			// Expected, routine state until Resend is configured with a verified domain — not a bug.
			return json(
				{ success: false, message: t['form.notConfigured'].replace('{{email}}', siteContact.email) },
				503,
			);
		}
		// API key present but the rest of the config is incomplete — a genuine
		// server-side bug now that production infra is provisioned.
		return json({ success: false, message: t['form.fallbackError'] }, 500);
	}
	const { apiKey, fromEmail, fromName, toEmail } = configResult.config;

	const submittedAtUtc = new Date().toUTCString();
	const emailData = { firstName, lastName, email, phone, message, submittedAtUtc };

	// No persistent rate limiter is wired up (no KV/Upstash store in this
	// project). An in-memory Map would not be reliable across Vercel's
	// serverless instances, so it's intentionally not implemented here.
	// Recommended real fix: a Vercel Firewall rate-limit rule on this path,
	// or a Vercel Marketplace store (e.g. Upstash Redis) if finer control is needed.

	const resend = new Resend(apiKey);

	try {
		const result = await Promise.race([
			resend.emails.send({
				from: `${fromName} <${fromEmail}>`,
				to: toEmail,
				replyTo: email,
				subject: `New portfolio enquiry from ${firstName} ${lastName}`,
				html: renderContactEmailHtml(emailData),
				text: renderContactEmailText(emailData),
			}),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Resend request timed out')), SEND_TIMEOUT_MS),
			),
		]);

		if (result.error) {
			console.error('Resend request failed', result.error.name, result.error.statusCode);
			return json({ success: false, message: t['form.fallbackError'] }, 502);
		}

		console.log('Contact email sent', result.data?.id);
		return json({ success: true, message: t['form.successToast'] }, 200);
	} catch (error) {
		console.error('Resend request failed or timed out', error instanceof Error ? error.message : error);
		return json({ success: false, message: t['form.fallbackError'] }, 502);
	}
};
