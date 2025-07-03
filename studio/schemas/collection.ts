// studio/schemas/collection.ts
export default {
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    {name: 'title', type: 'string'},
    {name: 'user', type: 'reference', to: [{type: 'user'}]},
    {
      name: 'recipes',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'recipe'}]}],
    },
  ],
}
