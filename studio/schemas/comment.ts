// studio/schemas/comment.ts
export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'recipe',
      title: 'Recipe',
      type: 'reference',
      to: [{type: 'recipe'}],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{type: 'comment'}],
      description: 'Reference to parent comment for threading (leave empty for top-level comments)',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: (Rule: any) => Rule.required().min(1).max(1000),
    },
    {
      name: 'containsProfanity',
      title: 'Contains Profanity',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'detectedProfanity',
      title: 'Detected Profanity Words',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Words that were flagged by the profanity filter',
    },
    {
      name: 'moderationFlags',
      title: 'Moderation Flags',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Additional moderation flags (spam, personal info, etc.)',
    },
    {
      name: 'autoModerated',
      title: 'Auto-Moderated',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this comment was automatically moderated',
    },
    {
      name: 'isApproved',
      title: 'Approved',
      type: 'boolean',
      initialValue: true, // Auto-approve for now, we'll add moderation later
      description: 'Whether this comment is approved for display',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'content',
      author: 'author.name',
      recipe: 'recipe.title',
    },
    prepare(selection: any) {
      const {title, author, recipe} = selection
      return {
        title: title ? `${title.substring(0, 50)}...` : 'No content',
        subtitle: `by ${author} on ${recipe}`,
      }
    },
  },
}
