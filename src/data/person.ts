import { siteContact } from '@/lib/site';

export const person = {
	name: 'Kostas Theodoropoulos',
	jobTitle: 'Web Developer',
	url: 'https://theodorodev.com',
	image: 'https://theodorodev.com/og/home.png',
	sameAs: [siteContact.githubHref, siteContact.linkedinHref].filter((href) => href !== '#'),
} as const;
