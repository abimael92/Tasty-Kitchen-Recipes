import { units, fractionMap, wordNumberMap } from '../constants/units';

export function parseIngredient(text: string) {
	// console.log('THIS IS RAW TEST: ', text);

	// Normalize the text first
	text = text
		.replace(/\u2044/g, '/') // Replace fraction slash
		.replace(/\s*\/\s*/g, '/') // Normalize spaces around slashes
		.replace(/⁄/g, '/') // Replace other fraction characters
		.replace(/^•\s*/, '') // Remove bullet points
		.trim();

	// Replace digit+fraction combos first (e.g. "1½" => "1 1/2")
	text = text.replace(
		/(\d)([½¼¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g,
		(_, n, f) => n + ' ' + (fractionMap[f] || f)
	);

	// Then replace any standalone fraction characters globally
	text = text.replace(
		/[½¼¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g,
		(match) => fractionMap[match] || match
	);

	// Remove common modifiers like "about", "approx", "around" from start
	text = text.replace(/^(about|approx\.?|around)\s+/i, '');

	// Replace number words with digits
	text = text.replace(
		/\b(one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\b/gi,
		(match) => wordNumberMap[match.toLowerCase()] || match
	);

	// console.log('Normalized text:', text);

	const parts = text.split(/\s+/).filter(Boolean);
	let quantity = '';
	let unit = '';
	let name = '';

	function isFraction(str: string): boolean {
		return /^\d+\/\d+$/.test(str);
	}

	function isDecimal(str: string): boolean {
		return /^\d+\.\d+$/.test(str) || /^\d+$/.test(str);
	}

	function isNumberWithFraction(str: string): boolean {
		return /^\d+\s+\d+\/\d+$/.test(str);
	}

	function isCombinedFraction(str: string): boolean {
		return /^\d+\/\d+$/.test(str) || /^\d+\.\d+$/.test(str);
	}

	// Check for different quantity formats
	if (parts.length > 0) {
		// Case 1: Combined number and fraction (e.g. "1 1/2")
		if (parts.length >= 2 && isNumberWithFraction(parts[0] + ' ' + parts[1])) {
			quantity = `${parts.shift()} ${parts.shift()}`;
		}
		// Case 2: Simple fraction (e.g. "1/2")
		else if (isCombinedFraction(parts[0])) {
			quantity = parts.shift() || '';
		}
		// Case 3: Regular number
		else if (!isNaN(Number(parts[0]))) {
			quantity = parts.shift() || '';
		}
	}

	// Check for unit
	if (parts.length > 0 && units.includes(parts[0].toLowerCase())) {
		unit = parts.shift() || '';
	}

	// The rest is the name
	name = parts.join(' ').trim().replace(/\.$/, ''); // Remove trailing period

	const parsed = {
		name: name.toLowerCase(),
		quantity,
		unit: unit.toLowerCase(),
		originalText: text,
		completed: false,
	};

	// console.log('Parsed result:', parsed);
	return parsed;
}
// Utility file
