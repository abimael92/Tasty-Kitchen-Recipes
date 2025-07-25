// In studio/schemas/groceryList.ts
export default {
  name: 'groceryList',
  title: 'Grocery List',
  type: 'document',
  fields: [
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{type: 'user'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'recipes',
      title: 'Recipes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'recipe'}],
        },
      ],
    },
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'groceryItem', // <-- ADD THIS LINE
          fields: [
            {name: 'name', title: 'Name', type: 'string'},
            {name: 'originalText', title: 'Original Text', type: 'string'},
            {name: 'quantity', title: 'Quantity', type: 'string'},
            {name: 'unit', title: 'Unit', type: 'string'},
            {name: 'completed', title: 'Completed', type: 'boolean', initialValue: false},
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      userName: 'user.name',
      items: 'items',
    },
    prepare({userName, items}) {
      return {
        title: `${userName}'s Grocery List`,
        subtitle: `${items?.length || 0} items`,
      }
    },
  },
}
