// src/utils/contentModeration.ts
import { Filter } from 'bad-words';

export class FamilyFriendlyModerator {
	private filter: Filter;
	private suggestiveTerms: Set<string>;
	private adultTopics: Set<string>;
	private hateSpeechTerms: Set<string>;

	constructor() {
		this.filter = new Filter();

		// Enhanced family-friendly filtering
		this.suggestiveTerms = new Set([
			'nsfw',
			'lewd',
			'explicit',
			'adult',
			'xxx',
			'porn',
			'porno',
			'pornography',
			'hentai',
			'erotic',
			'sexy',
			'seduce',
			'naughty',
			'risque',
			'provocative',
			'sensual',
			'intimate',
			'bedroom',
			'sexual',
			'sexually',
			'nude',
			'naked',
			'undress',
			'strip',
			'strip tease',
			'orgy',
			'orgies',
			'fetish',
			'bdsm',
			'masterbate',
			'masturbation',
			'ejaculation',
			'penis',
			'vagina',
			'boobs',
			'breasts',
			'butt',
			'ass',
			'anal',
			'blowjob',
			'handjob',
			'cum',
			'sperm',
		]);

		this.adultTopics = new Set([
			'drugs',
			'cocaine',
			'heroin',
			'meth',
			'marijuana',
			'weed',
			'pot',
			'lsd',
			'ecstasy',
			'mdma',
			'opioids',
			'overdose',
			'alcoholism',
			'drunk',
			'wasted',
			'alcoholic',
			'binge drinking',
			'prostitution',
			'escort',
			'hooker',
			'gambling',
			'casino',
			'betting',
			'illegal',
			'felony',
			'crime',
			'theft',
		]);

		this.hateSpeechTerms = new Set([
			'retard',
			'retarded',
			'spastic',
			'cripple',
			'gimp',
			'midget',
			'dwarf',
			'fag',
			'faggot',
			'dyke',
			'tranny',
			'shemale',
			'chink',
			'gook',
			'spic',
			'wetback',
			'kike',
			'yid',
			'raghead',
			'towelhead',
			'sandnigger',
			'beaner',
		]);

		// Add all custom terms to the filter
		const allCustomTerms = [
			...this.suggestiveTerms,
			...this.adultTopics,
			...this.hateSpeechTerms,
		];

		allCustomTerms.forEach((term) => this.filter.addWords(term));

		// Remove any cooking/food terms that might be false positives
		this.filter.removeWords('hell', 'damn'); // Common mild terms
	}

	validateComment(content: string): {
		isValid: boolean;
		errors: string[];
		flags: string[];
		severity: 'low' | 'medium' | 'high';
	} {
		const errors: string[] = [];
		const flags: string[] = [];
		let severity: 'low' | 'medium' | 'high' = 'low';

		// Basic validation
		if (content.length < 1) {
			errors.push('Comment cannot be empty');
		}

		if (content.length > 1000) {
			errors.push('Comment must be less than 1000 characters');
		}

		// Comprehensive content analysis
		const analysis = this.analyzeContent(content);

		if (analysis.profanity.hasProfanity) {
			errors.push('Comment contains inappropriate language');
			flags.push('profanity_detected');
			severity = this.getHighestSeverity(severity, 'high');
		}

		if (analysis.suggestive.hasSuggestive) {
			errors.push('Comment contains content not suitable for all ages');
			flags.push('suggestive_content');
			severity = this.getHighestSeverity(severity, 'high');
		}

		if (analysis.hateSpeech.hasHateSpeech) {
			errors.push('Comment contains unacceptable content');
			flags.push('hate_speech');
			severity = this.getHighestSeverity(severity, 'high');
		}

		if (analysis.adultTopics.hasAdultTopics) {
			errors.push('Comment discusses topics not suitable for this platform');
			flags.push('adult_topics');
			severity = this.getHighestSeverity(severity, 'medium');
		}

		if (analysis.spam.isSpam) {
			errors.push('Comment appears to be spam');
			flags.push('potential_spam');
			severity = this.getHighestSeverity(severity, 'medium');
		}

		if (analysis.personalInfo.hasPersonalInfo) {
			errors.push('Please do not share personal information');
			flags.push('personal_info_detected');
			severity = this.getHighestSeverity(severity, 'medium');
		}

		// Context-based filtering for cooking platform
		if (this.isOffTopic(content)) {
			flags.push('off_topic');
			// Don't block, just flag for moderation
		}

		return {
			isValid: errors.length === 0,
			errors,
			flags,
			severity,
		};
	}

	private analyzeContent(content: string) {
		const lowerContent = content.toLowerCase();

		return {
			profanity: this.checkForProfanity(content),
			suggestive: this.checkForSuggestiveContent(lowerContent),
			hateSpeech: this.checkForHateSpeech(lowerContent),
			adultTopics: this.checkForAdultTopics(lowerContent),
			spam: this.isPotentialSpam(content),
			personalInfo: this.containsPersonalInfo(content),
		};
	}

	private checkForProfanity(text: string): {
		hasProfanity: boolean;
		detectedWords: string[];
	} {
		try {
			const isClean = this.filter.isClean(text);

			if (isClean) {
				return { hasProfanity: false, detectedWords: [] };
			}

			const words = text.toLowerCase().split(/\s+/);
			const detectedWords = words.filter((word) => !this.filter.isClean(word));

			return {
				hasProfanity: true,
				detectedWords,
			};
		} catch (error) {
			return this.basicProfanityCheck(text);
		}
	}

	private checkForSuggestiveContent(content: string): {
		hasSuggestive: boolean;
		detectedTerms: string[];
	} {
		const words = content.split(/\s+/);
		const detectedTerms = words.filter((word) =>
			this.suggestiveTerms.has(word)
		);

		return {
			hasSuggestive: detectedTerms.length > 0,
			detectedTerms,
		};
	}

	private checkForHateSpeech(content: string): {
		hasHateSpeech: boolean;
		detectedTerms: string[];
	} {
		const words = content.split(/\s+/);
		const detectedTerms = words.filter((word) =>
			this.hateSpeechTerms.has(word)
		);

		return {
			hasHateSpeech: detectedTerms.length > 0,
			detectedTerms,
		};
	}

	private checkForAdultTopics(content: string): {
		hasAdultTopics: boolean;
		detectedTopics: string[];
	} {
		const words = content.split(/\s+/);
		const detectedTopics = words.filter((word) => this.adultTopics.has(word));

		return {
			hasAdultTopics: detectedTopics.length > 0,
			detectedTopics,
		};
	}

	private isOffTopic(content: string): boolean {
		const cookingContext = [
			'recipe',
			'cook',
			'cooking',
			'bake',
			'baking',
			'roast',
			'grill',
			'fry',
			'boil',
			'steam',
			'saute',
			'simmer',
			'broil',
			'ingredient',
			'ingredients',
			'oven',
			'stove',
			'kitchen',
			'pan',
			'pot',
			'skillet',
			'knife',
			'spoon',
			'fork',
			'plate',
			'bowl',
			'food',
			'meal',
			'breakfast',
			'lunch',
			'dinner',
			'dessert',
			'snack',
			'appetizer',
			'main course',
			'side dish',
			'flavor',
			'taste',
			'tasty',
			'delicious',
			'sweet',
			'savory',
			'spicy',
			'sour',
			'bitter',
			'umami',
			'seasoning',
			'salt',
			'pepper',
			'oil',
			'butter',
			'cream',
			'cheese',
			'sauce',
			'marinade',
			'herb',
			'spice',
			'preheat',
			'prep',
			'prepare',
			'chop',
			'slice',
			'dice',
			'mix',
			'stir',
			'whisk',
			'fold',
			'measure',
			'serve',
			'instructions',
			'steps',
			'recipe card',
			'garnish',
			'plate',
			'cookware',
			'utensil',
		];

		const contentWords = content.toLowerCase().split(/\s+/);
		const cookingWordsFound = contentWords.filter((word) =>
			cookingContext.some(
				(cookingWord) =>
					word.includes(cookingWord) || cookingWord.includes(word)
			)
		);

		// Use absolute count OR percentage - whichever is more lenient
		const hasMinimumCookingWords = cookingWordsFound.length >= 2;
		const hasGoodPercentage =
			cookingWordsFound.length / contentWords.length >= 0.15;

		// If less than 20% of content relates to cooking, flag as off-topic
		return !(hasMinimumCookingWords || hasGoodPercentage);
	}

	private isPotentialSpam(content: string): {
		isSpam: boolean;
		reasons: string[];
	} {
		const reasons: string[] = [];

		// Repeated characters
		const repeatedChars = /(.)\1{8,}/;
		if (repeatedChars.test(content)) {
			reasons.push('repeated_characters');
		}

		// Excessive capital letters
		const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
		if (capsRatio > 0.6 && content.length > 15) {
			reasons.push('excessive_caps');
		}

		// Multiple URLs
		const urlPattern = /https?:\/\/[^\s]+/g;
		const urlCount = (content.match(urlPattern) || []).length;
		if (urlCount > 1) {
			reasons.push('multiple_urls');
		}

		// Too many special characters
		const specialCharRatio =
			(content.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length /
			content.length;
		if (specialCharRatio > 0.25) {
			reasons.push('excessive_special_chars');
		}

		// Copy-paste patterns (common spam phrases)
		const spamPhrases = [
			'make money fast',
			'work from home',
			'get rich quick',
			'click here',
			'visit our website',
			'limited time offer',
			'buy now',
			'discount',
			'cheap',
			'viagra',
			'cialis',
		];

		const lowerContent = content.toLowerCase();
		if (spamPhrases.some((phrase) => lowerContent.includes(phrase))) {
			reasons.push('spam_phrases');
		}

		return {
			isSpam: reasons.length > 1, // Require multiple spam indicators
			reasons,
		};
	}

	private containsPersonalInfo(content: string): {
		hasPersonalInfo: boolean;
		types: string[];
	} {
		const types: string[] = [];

		// Email addresses
		const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
		if (emailPattern.test(content)) {
			types.push('email');
		}

		// Phone numbers
		const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
		if (phonePattern.test(content)) {
			types.push('phone');
		}

		// Social security numbers (US)
		const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
		if (ssnPattern.test(content)) {
			types.push('ssn');
		}

		// Credit card numbers (basic pattern)
		const ccPattern = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/;
		if (ccPattern.test(content)) {
			types.push('credit_card');
		}

		// Physical addresses (simple pattern)
		const addressPattern =
			/\b\d+\s+[\w\s]+\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|way)\b/i;
		if (addressPattern.test(content)) {
			types.push('address');
		}

		return {
			hasPersonalInfo: types.length > 0,
			types,
		};
	}

	private getHighestSeverity(
		current: string,
		newSeverity: string
	): 'low' | 'medium' | 'high' {
		const levels = { low: 0, medium: 1, high: 2 };
		return levels[newSeverity] > levels[current] ? newSeverity : current;
	}

	private basicProfanityCheck(text: string): {
		hasProfanity: boolean;
		detectedWords: string[];
	} {
		const basicProfanity = [
			'fuck',
			'shit',
			'asshole',
			'bitch',
			'cunt',
			'nigger',
			'nigga',
			'whore',
			'slut',
			'dick',
			'pussy',
			'cock',
			'bastard',
			'motherfucker',
		];

		const words = text.toLowerCase().split(/\s+/);
		const detectedWords = words.filter((word) =>
			basicProfanity.some((profanity) => word.includes(profanity))
		);

		return {
			hasProfanity: detectedWords.length > 0,
			detectedWords,
		};
	}

	// Method to get moderation summary for logging
	getModerationSummary(content: string) {
		const analysis = this.analyzeContent(content);
		const validation = this.validateComment(content);

		return {
			contentPreview:
				content.substring(0, 100) + (content.length > 100 ? '...' : ''),
			length: content.length,
			...analysis,
			validationResult: validation,
		};
	}

	shouldAutoApprove(content: string): boolean {
		const validation = this.validateComment(content);
		const analysis = this.analyzeContent(content);
		const isOffTopic = this.isOffTopic(content);

		console.log('🔍 Auto-approve analysis:', {
			content: content,
			isValid: validation.isValid,
			severity: validation.severity,
			isOffTopic: isOffTopic, // Add this
			flags: validation.flags,
		});

		// Block if any high-severity issues
		const shouldBlock =
			!validation.isValid || // Has validation errors (empty, too long, etc.)
			validation.severity === 'high' || // Profanity, hate speech, explicit content
			analysis.spam.isSpam || // Is spam
			isOffTopic; // Is off-topic

		return !shouldBlock; // Return true if we should NOT block
	}
}

export const contentModerator = new FamilyFriendlyModerator();
