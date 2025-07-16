// studio/schemas/recipeRating.ts
export default {
  name: 'recipeRating',
  title: 'Recipe Rating',
  type: 'document',
  fields: [
    {name: 'user', type: 'reference', to: [{type: 'user'}]},
    {name: 'recipe', type: 'reference', to: [{type: 'recipe'}]},
    {name: 'rating', type: 'number'},
    {name: 'ratedAt', type: 'datetime'},
  ],

  preview: {
    select: {
      userName: 'user.name',
      recipeName: 'recipe.title', // Assuming your recipe document has 'title', not 'name'
      rating: 'rating',
    },
    prepare({userName, recipeName, rating}) {
      return {
        title: `${userName || 'Unknown'} rated ${recipeName || 'Unknown'}`,
        subtitle: `Rating: ${rating ?? 'N/A'}`,
      }
    },
  },
}
