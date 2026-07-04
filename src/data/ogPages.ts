import { getProjects } from '@/lib/content';
import { ui, type Lang } from '@/i18n/ui';

interface OgPage {
	title: string;
	description: string;
}

function localePages(lang: Lang): Record<string, OgPage> {
	const t = ui[lang];
	return {
		home: { title: t['meta.home.title'], description: t['meta.home.description'] },
		about: { title: t['meta.about.title'], description: t['meta.about.description'] },
		contact: { title: t['meta.contact.title'], description: t['meta.contact.description'] },
		projects: { title: t['meta.projects.title'], description: t['meta.projects.description'] },
	};
}

export async function getOgPages(): Promise<Record<string, OgPage>> {
	const [projectsEn, projectsEl] = await Promise.all([getProjects('en'), getProjects('el')]);

	const pages: Record<string, OgPage> = { ...localePages('en') };

	for (const project of projectsEn) {
		pages[`projects/${project.data.slug}`] = {
			title: `${project.data.title} — theodorodev`,
			description: project.data.oneLiner,
		};
	}

	for (const [key, page] of Object.entries(localePages('el'))) {
		pages[`el/${key}`] = page;
	}

	for (const project of projectsEl) {
		pages[`el/projects/${project.data.slug}`] = {
			title: `${project.data.title} — theodorodev`,
			description: project.data.oneLiner,
		};
	}

	return pages;
}
