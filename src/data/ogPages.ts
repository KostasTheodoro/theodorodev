import { getProjects } from '@/lib/content';

interface OgPage {
	title: string;
	description: string;
}

export async function getOgPages(): Promise<Record<string, OgPage>> {
	const projects = await getProjects('en');

	const pages: Record<string, OgPage> = {
		home: {
			title: 'theodorodev — web developer, Athens',
			description:
				'I design and build fast, focused websites for small businesses and teams who need results, not bloat.',
		},
		about: {
			title: 'About — theodorodev',
			description:
				'Kostas Theodoropoulos, a developer based in Athens building fast, accessible websites for Greek small businesses and international teams.',
		},
		contact: {
			title: 'Contact — theodorodev',
			description: 'Get in touch to talk about your next website — email, phone, WhatsApp, or the form below.',
		},
		projects: {
			title: 'Projects — theodorodev',
			description:
				'A selection of websites built for small businesses and teams — fast, accessible, and focused on results.',
		},
	};

	for (const project of projects) {
		pages[`projects/${project.data.slug}`] = {
			title: `${project.data.title} — theodorodev`,
			description: project.data.oneLiner,
		};
	}

	return pages;
}
