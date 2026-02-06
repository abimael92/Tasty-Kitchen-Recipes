# Tasty Kitchen Recipes

**Blog de recetas bilingüe (ES/EN)** con autenticación, comentarios en tiempo real, valoraciones, favoritos, lista de la compra y perfil de usuario. Construido con Astro, React, Firebase y Sanity CMS.

---

## Problema que resuelve

Permite a usuarios **descubrir, guardar y cocinar recetas** con una experiencia unificada: recetas locales y desde CMS, comentarios en hilos con actualizaciones en tiempo real (SSE), valoraciones, lista de la compra generada desde ingredientes y perfil con historial (p. ej. BMI). Todo ello en **español e inglés** y con diseño responsive.

---

## Demo / Capturas

| Vista | Descripción |
|-------|-------------|
| ![Home](public/images/illustration-of-a-chef.webp) | Página de inicio con recetas destacadas |
| *(Añadir captura de lista de recetas)* | Listado con filtros y búsqueda |
| *(Añadir captura de detalle de receta)* | Receta con ingredientes, pasos, valoración y comentarios |
| *(Añadir captura de perfil)* | Perfil de usuario, favoritos y lista de la compra |

*Sustituir por capturas reales de la app en producción o desarrollo.*

---

## Funcionalidades principales

- **Recetas**: listado desde markdown (Content Collections) y Sanity CMS; detalle con ingredientes, instrucciones, imagen/vídeo, etiquetas y consejos.
- **Autenticación**: registro e inicio de sesión con Firebase; sesión con cookie HttpOnly y estado compartido entre islas (Astro).
- **Comentarios**: hilos anidados, moderación de contenido, actualizaciones en tiempo real vía SSE; edición/borrado con comprobación de autoría.
- **Valoraciones**: estrellas 1–5 por receta y usuario; media mostrada en receta.
- **Favoritos**: marcar/desmarcar recetas; página de favoritos para usuarios autenticados.
- **Lista de la compra**: generar lista desde ingredientes de recetas; toggle por receta; página dedicada con ítems deduplicados.
- **Perfil de usuario**: datos personales, historial BMI, recetas guardadas; solo para usuarios autenticados.
- **Añadir receta**: formulario (título, ingredientes, instrucciones, imagen/vídeo) con validación y subida a Sanity.
- **i18n**: español (por defecto) e inglés; selector de idioma en la UI.

---

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| **Invitado** | Ver recetas, comentarios y valoraciones. No puede comentar, valorar, guardar favoritos ni usar lista de la compra. |
| **Cliente** | Registrado con rol `client`: comentar, valorar, favoritos, lista de la compra, perfil y añadir recetas. |
| **Chef** | Registrado con rol `chef`: mismas capacidades que cliente (roles diferenciados para futuro uso). |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | [Astro](https://astro.build) 5 (SSR), [React](https://react.dev) 18 |
| **Hosting** | [Vercel](https://vercel.com) (`@astrojs/vercel`) |
| **Auth** | [Firebase Authentication](https://firebase.google.com/docs/auth) (cliente) + Firebase Admin SDK (verificación en API) |
| **CMS / Backend** | [Sanity](https://www.sanity.io) (recetas, usuarios, comentarios, valoraciones, favoritos, lista de la compra) |
| **Estilos** | CSS global, variables de diseño, módulos CSS donde aplica |
| **i18n** | Astro i18n (locales `es`, `en`) + JSON en `src/locales/` |
| **Otros** | Server-Sent Events (comentarios), Lottie (animaciones), Lucide/React Icons |

---

## Requisitos previos

- **Node.js** ≥ 18 (recomendado 20 LTS)
- **npm** ≥ 9 (o pnpm/yarn)
- Cuentas y proyectos:
  - [Firebase](https://console.firebase.google.com) (Auth + opcionalmente Admin para producción)
  - [Sanity](https://www.sanity.io) (proyecto y dataset)
- Para producción en Vercel: proyecto vinculado y variables de entorno configuradas

---

## Instalación paso a paso

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd astro-bakery-blog

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Rellenar .env con tus valores (Firebase, Sanity); ver sección Configuración

# 5. Arrancar en desarrollo
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321).

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (SSR, salida en `dist/`) |
| `npm run preview` | Sirve el build local para pruebas |
| `npm run check-translations` | Comprueba traducciones faltantes (`--missing-only`) |
| `npm run fix-translations` | Ajusta/rellena traducciones según script |
| `npm run audit` | Auditoría de seguridad de dependencias |
| `npm run audit:fix` | Aplica correcciones no breaking de `npm audit` |

---

## Estructura del proyecto

```
astro-bakery-blog/
├── public/                 # Assets estáticos (imágenes, favicons, vídeos)
│   ├── images/             # Imágenes de recetas y UI
│   └── ...
├── src/
│   ├── assets/             # SVGs y recursos usados por el build
│   ├── components/         # Componentes Astro y React reutilizables
│   ├── constants/          # Constantes (p. ej. unidades)
│   ├── content/            # Content Collections (recetas en markdown)
│   │   └── recipes/
│   ├── context/            # Re-export de AuthContext
│   ├── data/               # JSON estático (p. ej. consejos de cocina)
│   ├── features/           # Lógica por dominio (auth, comments, favorites, etc.)
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── favorites/
│   │   ├── grocery/
│   │   ├── profile/
│   │   └── ratings/
│   ├── hooks/              # Hooks React (rating, comentarios, receta)
│   ├── layouts/            # Layouts Astro (BaseLayout, Layout)
│   ├── lib/                # Re-exports de clientes (firebase, sanity)
│   ├── locales/            # Traducciones (en.json, es.json)
│   ├── pages/              # Rutas Astro y API
│   │   ├── api/            # Endpoints REST (auth, comentarios, favoritos, etc.)
│   │   ├── recipes/        # Listado y [slug] de receta
│   │   └── ...
│   ├── shared/             # Servicios, utilidades y store compartidos
│   │   ├── services/       # Firebase, Sanity, auth, sesión
│   │   ├── store/          # authStore (estado entre islas Astro)
│   │   └── utils/          # rateLimiter, contentModeration, apiError, etc.
│   ├── styles/             # global.css, módulos CSS, theme
│   └── utils/              # Re-exports y utilidades (i18n, slugify, etc.)
├── studio/                 # Proyecto Sanity Studio (esquemas, configuración)
├── tasty-kitchen-server/   # Servidor adicional (API, Vercel) si aplica
├── scripts/                # check-translations, fix-translations
├── docs/                   # Arquitectura, refactor, revisión SOLID
├── .env.example            # Plantilla de variables de entorno
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

- **Rutas**: definidas en `src/pages/` (Astro file-based routing).
- **API**: `src/pages/api/*.ts`; autenticación con `requireAuth` y cookies/Bearer.
- **Features**: cada dominio (auth, comments, favorites, grocery, profile, ratings) agrupa componentes y lógica.

---

## Configuración

### Variables de entorno

Copiar `.env.example` a `.env` y rellenar según entorno.

| Variable | Uso | Dónde |
|----------|-----|--------|
| `VITE_FIREBASE_*` | Cliente Firebase (Auth) | Cliente (público) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON de cuenta de servicio (Admin) | Solo servidor |
| `FIREBASE_PROJECT_ID` | Proyecto Firebase (Admin) | Servidor |
| `PUBLIC_SANITY_*` | Sanity para consultas públicas | Cliente |
| `SANITY_*` (sin PUBLIC) | Sanity para mutaciones y token | Solo servidor |
| `COOKIE_DOMAIN` | Dominio de la cookie de sesión (producción) | Opcional |

En producción es **obligatorio** tener `FIREBASE_SERVICE_ACCOUNT` para verificar tokens. En desarrollo puede usarse `GOOGLE_APPLICATION_CREDENTIALS` como alternativa.

Documentación detallada de cada variable en `.env.example`.

### Credenciales de ejemplo

No incluir credenciales reales en el repo. Para pruebas locales:

1. Firebase: crear proyecto → Authentication (Email/Password) → obtener config del cliente y, si aplica, clave de cuenta de servicio.
2. Sanity: `npm create sanity@latest` o desde [sanity.io](https://www.sanity.io) → projectId, dataset, token con permisos de escritura.
3. Rellenar `.env` y, si usas Sanity Studio local, configurar `studio/` con el mismo proyecto.

---

## Assets (imágenes, fuentes, iconos)

- **Imágenes de recetas y UI**: en `public/` o `public/images/`; referencias con rutas absolutas (p. ej. `/images/recipe.jpg`).
- **Favicons**: `public/images/favicon/` (incluye `favicon.ico`, PNG, `site.webmanifest`).
- **SVGs**: `src/assets/` (iconos sociales, fondos); importar donde se necesiten.
- **Fuentes**: definidas en `src/styles/global.css` (`--font-heading`, `--font-body`); uso de Inter y fallbacks del sistema.
- **Lottie**: animaciones vía `@lottiefiles/dotlottie-react` donde se use.

No se versionan binarios pesados en Git; usar CDN o almacenamiento externo si se escala.

---

## Estilos y UI/UX

- **Sistema de diseño**: variables CSS en `src/styles/global.css` (colores, espaciado, sombras, tipografía, breakpoints).
- **Paleta**: tonos cocina (rojo/terracota, crema, verde hierba, etc.) con variables semánticas (`--color-primary`, `--color-background`, etc.).
- **Responsive**: breakpoints `--breakpoint-mobile` (480px), `--breakpoint-tablet` (768px), `--breakpoint-desktop` (1024px); menú móvil y ajustes por viewport.
- **Tema**: soporte claro/oscuro vía `data-theme` y toggle en header.
- **Componentes**: mix de Astro (páginas, layouts, bloques estáticos) y React (islas interactivas: auth, comentarios, valoraciones, favoritos, lista de la compra).

---

## Limitaciones actuales

- **Islas Astro**: estado de auth compartido entre header y contenido vía store en módulo (`authStore`), no solo React Context.
- **API en un solo servicio**: rutas bajo `src/pages/api/`; sin agrupación por dominio en la ruta (p. ej. `/api/comments/...`).
- **Página de receta**: `[slug].astro` muy grande; recomendable dividir en componentes y extraer estilos/scripts.
- **Comentarios en tiempo real**: SSE en memoria; para múltiples instancias conviene Redis o equivalente.
- **Rate limiting**: en memoria con limpieza por TTL; en escala considerar Redis.
- **Algunos endpoints** siguen usando cabecera `x-forwarded-for` para rate limit cuando no hay usuario autenticado.
- Parte del código en **JSX** sin tipos; migración gradual a TS/TSX recomendada.

---

## Buenas prácticas usadas

- **Seguridad**: cookies de sesión HttpOnly, SameSite=Lax, respuestas de error genéricas al cliente y logging detallado en servidor, validación y saneamiento en submit de recetas, sanitización de comentarios (XSS), comprobación de autoría en edición/borrado de comentarios.
- **Auth**: Firebase Client + Admin; store compartido para islas; Bearer + cookie para API.
- **API**: `requireAuth` reutilizable; constantes para límites y ventanas de rate limit; limpieza de conexiones SSE y rate limiter con TTL.
- **Estructura**: features por dominio, `shared/` para servicios y utilidades, documentación en `docs/` (arquitectura, refactor, análisis de código).
- **i18n**: claves en JSON; scripts de comprobación y corrección de traducciones.
- **Build**: TypeScript donde se usa; sourcemaps en build; auditoría de dependencias con `npm run audit`.

---

## Roadmap / Próximos pasos

- [ ] Dividir `[slug].astro` en componentes y extraer estilos/scripts.
- [ ] Agrupar rutas API por dominio (p. ej. `api/auth/`, `api/comments/`).
- [ ] Migrar componentes críticos de JSX a TSX y definir tipos compartidos.
- [ ] Capa de validación centralizada (p. ej. Zod) en API.
- [ ] Sustituir rate limiting y/o SSE en memoria por Redis en producción.
- [ ] Revisar y actualizar dependencias (`npm audit`, actualizar Astro/React según recomendaciones).
- [ ] Añadir tests (unitarios para utilidades y servicios; E2E para flujos principales).
- [ ] Documentar y automatizar despliegue (Vercel, variables de entorno, Sanity deploy).

---

## Contribución

1. Haz fork del repositorio.
2. Crea una rama (`git checkout -b feature/nombre-breve`).
3. Realiza los cambios y pruebas locales (`npm run build`, `npm run dev`).
4. Commit con mensajes claros (`git commit -m 'feat: descripción'`).
5. Push a la rama y abre un Pull Request hacia `main` (o rama base indicada en el repo).
6. Responde a la revisión de código; se puede pedir ajustes antes de hacer merge.

Asegúrate de no subir `.env` ni credenciales; el proyecto usa `.env.example` como referencia.

---

## Licencia

Este proyecto está bajo la licencia que se indique en el repositorio (p. ej. MIT, propietaria). Consultar el archivo `LICENSE` en la raíz del repo.

---

## Autor

**Tasty Kitchen Recipes** – Proyecto de blog de recetas con Astro + React.

Para preguntas sobre el proyecto, abre un *Issue* en el repositorio.
