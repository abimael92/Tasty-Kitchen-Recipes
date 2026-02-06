# Features Checklist

Estado de las funcionalidades del producto frente a la lista objetivo. Usar este documento para priorizar desarrollo y comunicación con stakeholders.

---

## Feature list (objetivo vs estado)

| # | Feature | Estado | Notas |
|---|--------|--------|--------|
| 1 | **Rich recipe layout** (ingredients, instructions, media) | ✅ Done | Ingredientes, pasos, imagen y vídeo en detalle de receta |
| 2 | **Embedded video walkthroughs** | ✅ Done | Sección "Cooking Video" en receta; subida de vídeo en add-recipe (MP4/WebM) |
| 3 | **User star ratings (1–5)** | ✅ Done | `InteractiveRating`, `RecipeRatingDisplay`, API get/submit rating, media por receta |
| 4 | **Threaded comments** | ✅ Done | Respuestas anidadas, `get-nested-replies`, UI de hilos |
| 5 | **Emoji in comments** | ✅ Done | `EmojiPicker` en formulario de comentario y respuestas |
| 6 | **Markdown support in comments** | ❌ Missing | Comentarios son texto plano; se sanitiza HTML, no se renderiza Markdown |
| 7 | **Review photo uploads** | ❌ Missing | No hay subida de fotos en comentarios/reseñas; solo texto |
| 8 | **Author info, tags** | ✅ Done | `AuthorMeta` (chef), `RecipeTags`; filtros por chef y tags en listado |
| 9 | **Servings, calories** | ✅ Done | `NutritionInfo`, campos en receta y add-recipe |
| 10 | **Clickable tags and filters** (e.g. Vegan, 15 mins) | ⚠️ Partial | Filtros por tag/chef/rating en listado; en detalle de receta los tags no son enlaces; no hay filtros predefinidos tipo "Vegan" o "15 mins" |
| 11 | **Grocery list generator from ingredients** | ✅ Done | Toggle por receta, página lista de la compra, deduplicación |
| 12 | **Save/favorite recipes to user profile** | ✅ Done | Toggle favorito, página Favoritos, guardado en Sanity (collection por usuario) |
| 13 | **Create recipe collections** (e.g. "Quick Dinners") | ⚠️ Partial | Schema Sanity `collection` (title, user, recipes); en la app solo se usa una “colección” por usuario (favoritos). No hay UI para varias colecciones con nombre |
| 14 | **Analytics: views, saves, avg. rating** | ⚠️ Partial | Media de valoración sí (get-average-rating, count). No hay contador de vistas ni de “saves” por receta |
| 15 | **"Recipe of the Week" email subscription** | ❌ Missing | No hay suscripción por email ni envío de receta destacada; en About hay enlace /subscribe sin implementar |
| 16 | **Social sharing** (WhatsApp, Pinterest, Twitter) | ✅ Done | Barra de compartir en detalle de receta con enlaces a WhatsApp, Pinterest, Twitter |
| 17 | **Print-friendly view** | ✅ Done | Botón “Print Recipe” y estilos `@media print` en página de receta |
| 18 | **AI cooking tips** (e.g. "Add lemon zest") | ⚠️ Partial | Consejos de cocina sí (`AICookingTips.astro` + `cooking-tips.json`); son estáticos, no generados por IA |

---

## Resumen por estado

- **Done:** 10  
- **Partial:** 4  
- **Missing:** 4  

---

## Good to have (backlog)

Funcionalidades opcionales para mejorar producto y retención. No bloquean MVP.

### Contenido y descubrimiento

- [ ] **Markdown en comentarios** – Renderizar Markdown (o subset seguro) en contenido de comentarios.
- [ ] **Fotos en reseñas/comentarios** – Subir imagen opcional al comentar (storage + moderación).
- [ ] **Tags clickables en detalle de receta** – Enlazar cada tag a `/recipes?tag=...` (o filtro equivalente).
- [ ] **Filtros predefinidos** – Chips o filtros rápidos: “Vegan”, “Sin gluten”, “&lt; 15 min”, etc., basados en tags o metadatos.
- [ ] **Varias colecciones por usuario** – UI para crear/listar colecciones con nombre (p. ej. “Cenas rápidas”) y asignar recetas.

### Analytics y engagement

- [ ] **Vistas por receta** – Contador de visitas (por sesión o por usuario) y mostrarlo en receta/listado.
- [ ] **Número de saves** – Contador de “guardado en favoritos” por receta.
- [ ] **Recipe of the Week** – Lógica + email (o notificación) con receta destacada semanal; suscripción por email.

### Experiencia de uso

- [ ] **Consejos con IA** – Integrar API (p. ej. OpenAI) para sugerencias contextuales (“Añade ralladura de limón”, “Sustituir X por Y”) en la página de receta.
- [ ] **Modo oscuro persistente** – Guardar preferencia de tema y aplicarla en todas las páginas.
- [ ] **Búsqueda full-text** – Búsqueda en título, ingredientes, instrucciones y tags (backend + índice o Sanity).
- [ ] **Lista de la compra exportable** – Export a PDF o texto para llevar al supermercado.

### Calidad y mantenimiento

- [ ] **Tests E2E** – Flujos críticos: login, guardar receta, comentar, lista de la compra.
- [ ] **Validación con Zod (o similar)** – Capa única de validación en API para payloads y queries.
- [ ] **Refactor página receta** – Dividir `[slug].astro` en componentes y extraer estilos/scripts.

---

## Cómo usar este documento

1. **Planning** – Priorizar ítems “Partial” y “Missing” según impacto y esfuerzo.  
2. **README / Product** – Enlazar o copiar la tabla de “Feature list” para transparencia con el equipo o usuarios.  
3. **Good to have** – Ir moviendo ítems del backlog a la tabla principal cuando pasen a scope de un sprint.  
4. **Actualización** – Revisar y marcar ✅/⚠️/❌ al cerrar o cambiar funcionalidades.
