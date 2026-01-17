import en from '../locales/en.json';
import es from '../locales/es.json';

const translations = { en, es };

let currentLocale = 'es'; // Default to Spanish

export function setLocale(locale) {
	if (locale === 'en' || locale === 'es') {
		currentLocale = locale;
	}
	// If locale is invalid, stay with Spanish default
}

export function getLocale() {
	// ✅ Make sure this is exported!
	return currentLocale;
}

export function t(key: string): string {
	const parts = key.split('.');
	let result = translations[currentLocale];

	for (const part of parts) {
		if (!result || typeof result !== 'object' || !(part in result)) {
			// Try English as fallback
			let fallback = translations['en'];
			for (const fallbackPart of parts) {
				if (
					!fallback ||
					typeof fallback !== 'object' ||
					!(fallbackPart in fallback)
				) {
					return `[${key}]`; // Return key as fallback
				}
				fallback = fallback[fallbackPart];
			}
			return typeof fallback === 'string' ? fallback : `[${key}]`;
		}
		result = result[part];
	}

	return typeof result === 'string' ? result : `[${key}]`;
}
