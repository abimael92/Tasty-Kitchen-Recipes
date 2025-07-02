export const slugify = (str: string) =>
	str
		?.toLowerCase()
		?.replace(/\s+/g, '-')
		?.replace(/[^\w-]+/g, '');
