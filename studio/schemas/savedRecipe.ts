// studio/schemas/savedRecipe.ts
export default {
  name: 'savedRecipe',
  title: 'Saved Recipes',
  type: 'document',
  fields: [
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }]
    },
    {
      name: 'recipes',
      title: 'Recipes',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'savedRecipeItem',
          fields: [
            {
              name: 'recipe',
              title: 'Recipe',
              type: 'reference',
              to: [{ type: 'recipe' }],
              options: {
                weak: true
              }
            },
            {
              name: 'savedAt',
              title: 'Saved At',
              type: 'datetime'
            },
            {
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime'
            }
          ]
        }
      ]
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      userName: 'user.name',
      recipeCount: 'recipes.length'
    },
    prepare({ userName, recipeCount }) {
      return {
        title: `${userName}'s Saved Recipes`,
        subtitle: `${recipeCount || 0} recipes saved`
      }
    }
  }
}