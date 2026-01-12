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
		if (!result || !result.hasOwnProperty(part)) {
			// Log missing translations in development
			if (process.env.NODE_ENV === 'development') {
				console.warn(`Missing translation: ${key} for locale ${locale}`);
			}
			return key; // Return the key as fallback
		}
		result = result[part];
	}

	return typeof result === 'string' ? result : key;
}
