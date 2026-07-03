import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type ToastType = 'success' | 'error' | 'info';
type Toast = { type: ToastType; message: string };

const FALLBACK_ERROR = 'Something went wrong sending your message — please try again or email me directly.';

const toastClasses: Record<ToastType, string> = {
	success: 'border-status-available text-status-available',
	error: 'border-status-busy text-status-busy',
	info: 'border-border text-text-muted',
};

export default function ContactForm() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState<Status>('idle');
	const [toast, setToast] = useState<Toast | null>(null);
	const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		return () => clearTimeout(dismissTimer.current);
	}, []);

	function showToast(next: Toast) {
		clearTimeout(dismissTimer.current);
		setToast(next);
		dismissTimer.current = setTimeout(() => setToast(null), 6000);
	}

	async function submit() {
		setStatus('submitting');

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message }),
			});
			const data: { ok: boolean; error?: string } = await response.json();

			if (data.ok) {
				setStatus('success');
				setName('');
				setEmail('');
				setMessage('');
				showToast({ type: 'success', message: "Message sent — thanks, I'll get back to you soon." });
			} else {
				setStatus('error');
				// A 503 here means the form isn't wired to Resend yet — routine, not a failure on the visitor's end.
				showToast({ type: response.status === 503 ? 'info' : 'error', message: data.error ?? FALLBACK_ERROR });
			}
		} catch {
			setStatus('error');
			showToast({ type: 'error', message: FALLBACK_ERROR });
		}
	}

	const submitting = status === 'submitting';

	return (
		<div className="flex flex-col gap-4">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					submit();
				}}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-name" className="text-sm text-text">
						Name
					</label>
					<input
						id="contact-name"
						name="name"
						type="text"
						required
						value={name}
						onChange={(event) => setName(event.target.value)}
						className="rounded border border-border bg-bg-card px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-email" className="text-sm text-text">
						Email
					</label>
					<input
						id="contact-email"
						name="email"
						type="email"
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="rounded border border-border bg-bg-card px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-message" className="text-sm text-text">
						Message
					</label>
					<textarea
						id="contact-message"
						name="message"
						required
						rows={5}
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						className="rounded border border-border bg-bg-card px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<button
					type="submit"
					disabled={submitting}
					className="flex items-center justify-center gap-2 rounded bg-primary px-5 py-2.5 text-sm text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{submitting && (
						<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
						</svg>
					)}
					{submitting ? 'Sending…' : 'Send message'}
				</button>
			</form>

			{toast && (
				<div
					role="status"
					aria-live="polite"
					className={`contact-toast rounded border bg-bg-card px-4 py-3 text-sm ${toastClasses[toast.type]}`}
				>
					{toast.message}
				</div>
			)}

			<style>{`
				@media (prefers-reduced-motion: no-preference) {
					.contact-toast {
						animation: contact-toast-in 200ms ease;
					}
				}
				@keyframes contact-toast-in {
					from {
						opacity: 0;
						transform: translateY(4px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
}
