import { ui, defaultLang, type Lang, type UiKey } from '@/i18n/ui';

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first === 'el' ? 'el' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Strips the /el prefix to get the locale-independent path used to build
// switcher/hreflang URLs, e.g. '/el/projects/garts' -> 'projects/garts', '/el' -> ''.
export function getLogicalPath(url: URL): string {
  return url.pathname.replace(/^\/el(\/|$)/, '/').replace(/^\//, '').replace(/\/$/, '');
}
