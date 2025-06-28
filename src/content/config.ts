import { defineCollection, z } from 'astro:content';

const recipesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    ingredients: z.array(z.string()).or(z.string().transform(str => str.split('\n').filter(Boolean))),
    instructions: z.array(z.string()).or(z.string().transform(str => str.split('\n').filter(Boolean))),
    image: z.string().optional(),
    video: z.string().optional(),
    prepTime: z.string().optional(),
    cookTime: z.string().optional(),
    servings: z.number().optional(),
  })
});

export const collections = {
  'recipes': recipesCollection,
};