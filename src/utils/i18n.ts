import en from '../locales/en.json';
import es from '../locales/es.json';

const translations: Record<string, any> = {
	en,
	es,
};

export function t(key: string, locale: string = 'es'): string {
	const parts = key.split('.');
	let result: any = translations[locale];

	for (const part of parts) {
		if (!result || !result.hasOwnProperty(part)) return key;
		result = result[part];
	}

	return typeof result === 'string' ? result : key;
}
// Utility file
