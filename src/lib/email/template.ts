export interface ContactEmailData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	message: string;
	submittedAtUtc: string;
}

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export function escapeHtml(input: string): string {
	return input.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function escapeHtmlPreservingLineBreaks(input: string): string {
	return escapeHtml(input).replace(/\n/g, '<br>');
}

export function renderContactEmailHtml(data: ContactEmailData): string {
	const name = `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`;
	const email = escapeHtml(data.email);
	const phoneRow = data.phone
		? `<tr><td style="padding:4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${escapeHtml(data.phone)}</td></tr>`
		: '';

	return `<!doctype html>
<html>
	<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
		<div style="max-width:560px;margin:0 auto;padding:24px;">
			<p style="font-size:13px;color:#666;margin:0 0 16px;">New enquiry from the contact form on theodorodev.com</p>
			<table style="width:100%;border-collapse:collapse;font-size:14px;color:#111;">
				<tr><td style="padding:4px 0;color:#666;width:96px;">Name</td><td style="padding:4px 0;">${name}</td></tr>
				<tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${email}" style="color:#111;">${email}</a></td></tr>
				${phoneRow}
				<tr><td style="padding:4px 0;color:#666;">Sent</td><td style="padding:4px 0;">${escapeHtml(data.submittedAtUtc)}</td></tr>
			</table>
			<p style="font-size:14px;color:#111;white-space:pre-wrap;margin:16px 0;padding:12px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;">${escapeHtmlPreservingLineBreaks(data.message)}</p>
			<p style="font-size:12px;color:#999;margin:16px 0 0;">Replying to this email will reply directly to ${name} at ${email}.</p>
		</div>
	</body>
</html>`;
}

export function renderContactEmailText(data: ContactEmailData): string {
	const phoneLine = data.phone ? `Phone: ${data.phone}\n` : '';
	return `New enquiry from the contact form on theodorodev.com

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
${phoneLine}Sent: ${data.submittedAtUtc}

Message:
${data.message}

Replying to this email will reply directly to ${data.firstName} ${data.lastName} at ${data.email}.`;
}
