/// <reference types="bun-types" />
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { escapeHtml, renderContactEmailHtml } from '@/lib/email/template';

const sendMock = mock(async (_payload: Record<string, unknown>) => ({ data: { id: 'test-message-id' }, error: null }) as any);

mock.module('resend', () => ({
	Resend: class {
		emails = { send: sendMock };
	},
}));

const { POST } = await import('../../src/pages/api/contact');

const ENV_KEYS = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_FROM_NAME', 'CONTACT_TO_EMAIL'] as const;

function setValidEnv() {
	process.env.RESEND_API_KEY = 're_test_key';
	process.env.CONTACT_FROM_EMAIL = 'contact@theodorodev.com';
	process.env.CONTACT_FROM_NAME = 'TheodoroDev Website';
	process.env.CONTACT_TO_EMAIL = 'kostas@theodorodev.com';
}

function clearEnv() {
	for (const key of ENV_KEYS) delete process.env[key];
}

function request(body: unknown): Request {
	return new Request('http://localhost/api/contact', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

const VALID_PAYLOAD = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.com',
	phone: '',
	message: 'Hello, I would like to discuss a project with you, please get in touch.',
};

describe('POST /api/contact', () => {
	beforeEach(() => {
		setValidEnv();
		sendMock.mockClear();
		sendMock.mockImplementation(async () => ({ data: { id: 'test-message-id' }, error: null }) as any);
	});

	afterEach(() => {
		clearEnv();
	});

	test('valid submission sends via Resend and reports success', async () => {
		const response = await POST({ request: request(VALID_PAYLOAD) } as any);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(sendMock).toHaveBeenCalledTimes(1);

		const call = sendMock.mock.calls[0][0];
		expect(call.from).toBe('TheodoroDev Website <contact@theodorodev.com>');
		expect(call.to).toBe('kostas@theodorodev.com');
		expect(call.replyTo).toBe('ada@example.com');
		expect(call.subject).toBe('New portfolio enquiry from Ada Lovelace');
	});

	test('logs the Resend message id after a successful send', async () => {
		const logSpy = spyOn(console, 'log').mockImplementation(() => {});
		await POST({ request: request(VALID_PAYLOAD) } as any);
		expect(logSpy).toHaveBeenCalledWith('Contact email sent', 'test-message-id');
		logSpy.mockRestore();
	});

	test('rejects an invalid email address', async () => {
		const response = await POST({
			request: request({ ...VALID_PAYLOAD, email: 'not-an-email' }),
		} as any);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.errors.email).toBeTruthy();
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('rejects an empty first name', async () => {
		const response = await POST({
			request: request({ ...VALID_PAYLOAD, firstName: '' }),
		} as any);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.errors.firstName).toBeTruthy();
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('rejects a too-short message', async () => {
		const response = await POST({
			request: request({ ...VALID_PAYLOAD, message: 'too short' }),
		} as any);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.errors.message).toBeTruthy();
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('rejects an oversized message', async () => {
		const response = await POST({
			request: request({ ...VALID_PAYLOAD, message: 'a'.repeat(5001) }),
		} as any);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.errors.message).toBeTruthy();
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('silently accepts a honeypot submission without sending', async () => {
		const response = await POST({
			request: request({ ...VALID_PAYLOAD, website: 'https://spam.example' }),
		} as any);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('returns 503 when RESEND_API_KEY is missing', async () => {
		delete process.env.RESEND_API_KEY;
		const response = await POST({ request: request(VALID_PAYLOAD) } as any);
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.success).toBe(false);
		expect(sendMock).not.toHaveBeenCalled();
	});

	test('returns 500 and does not leak var names when partially configured', async () => {
		delete process.env.CONTACT_TO_EMAIL;
		const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

		const response = await POST({ request: request(VALID_PAYLOAD) } as any);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body.success).toBe(false);
		expect(JSON.stringify(body)).not.toContain('CONTACT_TO_EMAIL');
		expect(sendMock).not.toHaveBeenCalled();

		errorSpy.mockRestore();
	});

	test('returns 502 and a generic message when Resend reports an error', async () => {
		sendMock.mockImplementation(
			async () => ({ data: null, error: { message: 'invalid api key', statusCode: 401, name: 'invalid_api_key' } }) as any,
		);
		const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

		const response = await POST({ request: request(VALID_PAYLOAD) } as any);
		const body = await response.json();

		expect(response.status).toBe(502);
		expect(body.success).toBe(false);
		expect(JSON.stringify(body)).not.toContain('invalid api key');

		errorSpy.mockRestore();
	});

	test('returns 502 when the Resend call throws', async () => {
		sendMock.mockImplementation(async () => {
			throw new Error('network down');
		});
		const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

		const response = await POST({ request: request(VALID_PAYLOAD) } as any);
		const body = await response.json();

		expect(response.status).toBe(502);
		expect(body.success).toBe(false);

		errorSpy.mockRestore();
	});

	test('from and to come from env config, not a hardcoded address', async () => {
		process.env.CONTACT_FROM_EMAIL = 'other@example.com';
		process.env.CONTACT_FROM_NAME = 'Other Sender';
		process.env.CONTACT_TO_EMAIL = 'other-inbox@example.com';

		await POST({ request: request(VALID_PAYLOAD) } as any);

		const call = sendMock.mock.calls[0][0];
		expect(call.from).toBe('Other Sender <other@example.com>');
		expect(call.to).toBe('other-inbox@example.com');
	});

	test('rejects malformed JSON bodies safely', async () => {
		const badRequest = new Request('http://localhost/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{not json',
		});
		const response = await POST({ request: badRequest } as any);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(sendMock).not.toHaveBeenCalled();
	});
});

describe('email template escaping', () => {
	test('escapeHtml escapes all HTML-significant characters', () => {
		expect(escapeHtml(`<script>alert('x')</script> & "quoted"`)).toBe(
			'&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &quot;quoted&quot;',
		);
	});

	test('renderContactEmailHtml escapes visitor-controlled values', () => {
		const html = renderContactEmailHtml({
			firstName: '<img src=x onerror=alert(1)>',
			lastName: 'Doe',
			email: 'attacker@example.com',
			phone: '',
			message: 'line one\nline two',
			submittedAtUtc: 'Mon, 06 Jul 2026 00:00:00 GMT',
		});

		expect(html).not.toContain('<img src=x onerror=alert(1)>');
		expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
		expect(html).toContain('line one<br>line two');
	});
});
