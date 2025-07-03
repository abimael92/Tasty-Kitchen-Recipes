// studio/schemas/savedRecipe.ts
export default {
  name: 'savedRecipe',
  title: 'Saved Recipe',
  type: 'document',
  fields: [
    {name: 'user', type: 'reference', to: [{type: 'user'}]},
    {name: 'recipe', type: 'reference', to: [{type: 'recipe'}]},
    {name: 'savedAt', type: 'datetime'},
  ],
}
