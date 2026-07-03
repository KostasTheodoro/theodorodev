import { getCollection, type CollectionEntry } from 'astro:content';

type Lang = CollectionEntry<'projects'>['data']['lang'];

function byOrder(a: CollectionEntry<'projects'>, b: CollectionEntry<'projects'>) {
  return a.data.order - b.data.order;
}

export async function getProjects(lang: Lang) {
  const entries = await getCollection('projects', ({ data }) => data.lang === lang);
  return entries.sort(byOrder);
}

export async function getFeaturedProjects(lang: Lang) {
  const entries = await getCollection(
    'projects',
    ({ data }) => data.lang === lang && data.featured,
  );
  return entries.sort(byOrder);
}

export async function getProjectBySlug(slug: string, lang: Lang) {
  const entries = await getCollection(
    'projects',
    ({ data }) => data.slug === slug && data.lang === lang,
  );
  return entries[0];
}

export async function getAdjacentProjects(slug: string, lang: Lang) {
  const entries = await getProjects(lang);
  const index = entries.findIndex((entry) => entry.data.slug === slug);
  return { prev: entries[index - 1], next: entries[index + 1] };
}
