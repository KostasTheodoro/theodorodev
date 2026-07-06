// Read lazily inside request handlers, never at module scope — this keeps
// unrelated static pages from depending on env vars that only the contact
// route needs.
export interface ContactEmailConfig {
	apiKey: string;
	fromEmail: string;
	fromName: string;
	toEmail: string;
}

export type ContactEmailConfigResult =
	| { ok: true; config: ContactEmailConfig }
	// No RESEND_API_KEY: expected/routine before Resend is wired up (or in
	// preview environments without secrets) — callers should respond 503.
	| { ok: false; reason: 'not_configured' }
	// API key present but the rest is incomplete: a real misconfiguration
	// now that production infra is provisioned — callers should respond 500.
	| { ok: false; reason: 'misconfigured' };

export function getContactEmailConfig(): ContactEmailConfigResult {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		return { ok: false, reason: 'not_configured' };
	}

	const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;
	const fromName = import.meta.env.CONTACT_FROM_NAME;
	const toEmail = import.meta.env.CONTACT_TO_EMAIL;

	if (!fromEmail || !fromName || !toEmail) {
		const missing = [
			!fromEmail && 'CONTACT_FROM_EMAIL',
			!fromName && 'CONTACT_FROM_NAME',
			!toEmail && 'CONTACT_TO_EMAIL',
		].filter(Boolean);
		console.error('Contact email misconfigured, missing env vars:', missing.join(', '));
		return { ok: false, reason: 'misconfigured' };
	}

	return { ok: true, config: { apiKey, fromEmail, fromName, toEmail } };
}
