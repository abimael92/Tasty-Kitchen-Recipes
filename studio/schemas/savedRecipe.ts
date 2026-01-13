// studio/schemas/savedRecipe.ts
export default {
  name: 'savedRecipe',
  title: 'Saved Recipes',
  type: 'document',
  fields: [
    {
      name: 'user',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (Rule) => Rule.required().unique(),
    },
    {
      name: 'recipes',
      title: 'Saved Recipes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'recipe',
              type: 'reference',
              to: [{type: 'recipe'}],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'savedAt',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'notes',
              type: 'text',
              rows: 3,
              title: 'Personal Notes',
            },
          ],
        },
      ],
    },
    {
      name: 'lastUpdated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      userName: 'user.name',
      recipeCount: 'recipes.length',
      lastUpdated: 'lastUpdated',
    },
    prepare({userName, recipeCount, lastUpdated}) {
      return {
        title: `${userName || 'User'}'s Saved Recipes`,
        subtitle: `${recipeCount || 0} recipes • Last updated: ${
          lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'
        }`,
      }
    },
  },
}
