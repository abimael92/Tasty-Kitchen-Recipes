# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

🧁 Astro + Sanity Recipe Blog

📖 Features

🍰 Rich recipe layout with ingredients, instructions, media

📹 Embedded video walkthroughs

🌟 User star ratings (1–5)

💬 Threaded comments with emoji and Markdown

📷 Review photo uploads

🧑‍🍳 Author info, tags, servings, calories 🍽

🏷 Clickable tags and filters (e.g. Vegan, 15 mins)

🧾 Generate grocery lists from ingredients

📌 Save/favorite recipes to user profile

🗂 Create collections (e.g. "Quick Dinners")

📊 View analytics: views, saves, avg. rating

📬 Subscribe to "Recipe of the Week" email

🔗 Share to WhatsApp, Pinterest, Twitter

🖨 Print-friendly view

🧠 AI tips like "Add lemon zest for brightness"

📌 Project Boards (GitHub Projects)

Column

Cards (Tasks)

To Do

Add NutritionInfo, Add ReviewForm, Sanity: Add difficulty/time fields

In Progress

Implement RatingStars UI

Done

Recipe slug fix, Sanity image integration

🐛 GitHub Issues (Paste These)

Issue: Add user rating system ⭐

**Description**
Allow users to submit 1–5 star rating on each recipe.

**Tasks**

- Create RatingStars.astro component
- Add rating field to Sanity schema
- Show average rating below title
- Persist rating for logged-in user (optional)

Issue: Review form with photo upload ✍️

**Description**
Add a form where users can write a review, rate it, and upload a photo.

**Tasks**

- Create ReviewForm.astro
- Add star input + textarea
- Allow photo upload (jpg/png only)
- Save to Sanity (or Firebase alt)

Issue: Sanity schema - Add difficulty + cookingTime

**Description**
Update recipe schema in Sanity:

**Fields to add**

- `difficulty`: enum (Beginner, Intermediate, Expert)
- `cookingTime`: number (minutes)

**Tasks**

- Edit `studio/schemas/recipe.ts`
- Add fields & deploy
- Show in recipe detail UI

✅ Milestones

MVP (v1.0)

View recipes (local + sanity)

Recipe detail page w/ ingredients, instructions

Add video, rating, tags, calories

Add comment system

v1.1 – User Interaction

User ratings

Reviews with photo

AI cooking tips

v1.2 – User Profiles & Save Features

Auth & saved recipes

Create collections

Grocery list builder

🗃 Labels to Use

frontend

sanity

enhancement

bug

feature

schema

style
