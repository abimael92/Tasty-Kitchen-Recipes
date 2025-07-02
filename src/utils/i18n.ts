import en from '../locales/en.json';
import es from '../locales/es.json';

const translations = { en, es };

export function t(key: string, locale: 'en' | 'es'): string {
	const keys = key.split('.');
	let value: any = translations[locale];

	for (const k of keys) {
		value = value?.[k];
		if (value === undefined) break;
	}

	return value || key;
}
