import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { ui, defaultLang, type Lang } from '@/i18n/ui';

type FieldName = 'firstName' | 'lastName' | 'email' | 'phone' | 'message';
type Fields = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
type ButtonPhase = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY_FIELDS: Fields = { firstName: '', lastName: '', email: '', phone: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHASE_HOLD_MS = 800;

interface Props {
	lang?: Lang;
}

export default function ContactForm({ lang = defaultLang }: Props) {
	const t = ui[lang];
	const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
	const [errors, setErrors] = useState<Errors>({});
	const [buttonPhase, setButtonPhase] = useState<ButtonPhase>('idle');
	const phaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		return () => clearTimeout(phaseTimer.current);
	}, []);

	function updateField(field: FieldName, value: string) {
		setFields((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	function validate(): Errors {
		const next: Errors = {};
		if (!fields.firstName.trim()) next.firstName = t['form.required'];
		if (!fields.lastName.trim()) next.lastName = t['form.required'];
		if (!fields.email.trim()) next.email = t['form.required'];
		else if (!EMAIL_RE.test(fields.email.trim())) next.email = t['form.invalidEmail'];
		if (!fields.message.trim()) next.message = t['form.required'];
		return next;
	}

	function scheduleAfterPhase(after: () => void) {
		clearTimeout(phaseTimer.current);
		phaseTimer.current = setTimeout(() => {
			setButtonPhase('idle');
			after();
		}, PHASE_HOLD_MS);
	}

	async function submit() {
		setButtonPhase('submitting');

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...fields, lang }),
			});
			const data: { ok: boolean; error?: string } = await response.json();

			if (data.ok) {
				setButtonPhase('success');
				scheduleAfterPhase(() => {
					setFields(EMPTY_FIELDS);
					toast.success(t['form.successToast']);
				});
			} else {
				setButtonPhase('error');
				scheduleAfterPhase(() => {
					// A 503 here means the form isn't wired to Resend yet — routine, not a failure on the visitor's end.
					if (response.status === 503) {
						toast.message(data.error ?? t['form.notConfigured']);
					} else {
						toast.error(data.error ?? t['form.fallbackError']);
					}
				});
			}
		} catch {
			setButtonPhase('error');
			scheduleAfterPhase(() => toast.error(t['form.fallbackError']));
		}
	}

	function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		submit();
	}

	const fieldClass =
		'rounded border border-border bg-bg-card px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary';

	function renderError(field: FieldName) {
		return errors[field] ? (
			<p id={`contact-${field}-error`} className="text-sm text-status-busy">
				{errors[field]}
			</p>
		) : null;
	}

	return (
		<div className="rounded border border-border bg-bg-card p-6 flex flex-col gap-4">
			<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="contact-firstName" className="text-sm text-text">
							{t['form.labelFirstName']}
							<span className="text-status-busy"> *</span>
						</label>
						<input
							id="contact-firstName"
							name="firstName"
							type="text"
							placeholder={t['form.placeholderFirstName']}
							value={fields.firstName}
							onChange={(event) => updateField('firstName', event.target.value)}
							aria-invalid={!!errors.firstName}
							aria-describedby={errors.firstName ? 'contact-firstName-error' : undefined}
							className={fieldClass}
						/>
						{renderError('firstName')}
					</div>
					<div className="flex flex-col gap-1.5">
						<label htmlFor="contact-lastName" className="text-sm text-text">
							{t['form.labelLastName']}
							<span className="text-status-busy"> *</span>
						</label>
						<input
							id="contact-lastName"
							name="lastName"
							type="text"
							placeholder={t['form.placeholderLastName']}
							value={fields.lastName}
							onChange={(event) => updateField('lastName', event.target.value)}
							aria-invalid={!!errors.lastName}
							aria-describedby={errors.lastName ? 'contact-lastName-error' : undefined}
							className={fieldClass}
						/>
						{renderError('lastName')}
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-email" className="text-sm text-text">
						{t['form.labelEmail']}
						<span className="text-status-busy"> *</span>
					</label>
					<input
						id="contact-email"
						name="email"
						type="email"
						placeholder={t['form.placeholderEmail']}
						value={fields.email}
						onChange={(event) => updateField('email', event.target.value)}
						aria-invalid={!!errors.email}
						aria-describedby={errors.email ? 'contact-email-error' : undefined}
						className={fieldClass}
					/>
					{renderError('email')}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-phone" className="text-sm text-text">
						{t['form.labelPhone']}
						<span className="text-sm italic text-text-muted"> {t['form.optional']}</span>
					</label>
					<input
						id="contact-phone"
						name="phone"
						type="tel"
						placeholder={t['form.placeholderPhone']}
						value={fields.phone}
						onChange={(event) => updateField('phone', event.target.value)}
						className={fieldClass}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="contact-message" className="text-sm text-text">
						{t['form.labelMessage']}
						<span className="text-status-busy"> *</span>
					</label>
					<textarea
						id="contact-message"
						name="message"
						rows={5}
						placeholder={t['form.placeholderMessage']}
						value={fields.message}
						onChange={(event) => updateField('message', event.target.value)}
						aria-invalid={!!errors.message}
						aria-describedby={errors.message ? 'contact-message-error' : undefined}
						className={fieldClass}
					/>
					{renderError('message')}
				</div>

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={buttonPhase === 'submitting'}
						className="flex items-center justify-center gap-2 rounded bg-primary px-5 py-2.5 text-sm text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{buttonPhase === 'submitting' && (
							<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
							</svg>
						)}
						{buttonPhase === 'success' && (
							<svg
								className="contact-btn-icon h-4 w-4 text-status-available"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						)}
						{buttonPhase === 'error' && (
							<svg
								className="contact-btn-icon h-4 w-4 text-status-busy"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
							</svg>
						)}
						{buttonPhase === 'idle' && t['form.send']}
						{buttonPhase === 'submitting' && t['form.sending']}
					</button>
				</div>
			</form>

			<Toaster
				position="bottom-right"
				toastOptions={{
					unstyled: true,
					classNames: {
						toast: 'flex items-center gap-2 rounded border border-border bg-bg-card px-4 py-3 text-sm text-text shadow-lg',
						title: 'text-text',
						description: 'text-text-muted',
						success: 'border-status-available',
						error: 'border-status-busy',
					},
				}}
			/>

			<style>{`
				@media (prefers-reduced-motion: no-preference) {
					.contact-btn-icon {
						animation: contact-btn-in 200ms ease;
					}
				}
				@keyframes contact-btn-in {
					from {
						opacity: 0;
						transform: scale(0.7);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
			`}</style>
		</div>
	);
}
