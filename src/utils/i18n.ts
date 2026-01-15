import en from '../locales/en.json';
import es from '../locales/es.json';

const translations = { en, es };

let currentLocale = 'es';

export function setLocale(locale: 'en' | 'es') {
	currentLocale = locale;
}

export function getLocale() {
	return currentLocale;
}

export function t(key: string): string {
	const parts = key.split('.');
	let result: any = translations[currentLocale];

	for (const part of parts) {
		if (!result || !Object.prototype.hasOwnProperty.call(result, part)) {
			return key;
		}
		result = result[part];
	}

	return typeof result === 'string' ? result : key;
}
