# Package dependencies

Reference for `package.json` **dependencies** (and a short **devDependencies** section). Versions match `package.json` at the time this file was written; run `npm ls <pkg>` for the resolved tree.

This app is **Vite + React** (not Next.js). **shadcn/ui** is configured via `components.json` and lives as source under `src/components/ui/`; it is not an npm package named `shadcn`.

---

## Runtime dependencies (`dependencies`)

### Core UI & routing

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **react** | ^19.1.1 | UI library | All components; `main.tsx` (`StrictMode`). |
| **react-dom** | ^19.1.1 | Renders React to the DOM | `main.tsx` (`createRoot`). |
| **react-router-dom** | ^7.9.4 | Client-side routing | `main.tsx` (`BrowserRouter`), `App.tsx` (`Routes` / `Route`), layouts, pages, nav (`Bottombar`, `LeftSidebar`, `Topbar`), forms (`Link`, `useNavigate`, `useParams`). |

### Backend & feeds

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **appwrite** | ^21.2.1 | Auth, database, storage, avatars | `src/lib/appwrite/config.ts`, `src/lib/appwrite/api.ts`. |
| **@stream-io/feeds-client** | ^0.3.0 | Stream Feeds client, types, helpers | `src/lib/stream/api.ts`, `src/lib/stream/hooks.tsx`, `AuthContext.tsx`, `Explore.tsx`, `FileUploader.tsx`, `PostHeader.tsx` (`react-bindings`), `types/index.ts`, notification-related code. |
| **@stream-io/feeds-react-sdk** | ^0.1.28 | React hooks & providers for Feeds | `RootLayout.tsx` (`StreamFeeds`), feed hooks, `Notifications.tsx`, etc. |

### Async / server state

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **@tanstack/react-query** | ^5.90.5 | Queries, mutations, cache | `src/lib/react-query/QueryProvider.tsx`, `queriesAndMutations.ts`, `cacheUtils.ts`. |

### Forms & validation

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **react-hook-form** | ^7.65.0 | Form state & controllers | `PostForm.tsx`, `SignInForm.tsx`, `SignUpForm.tsx`, `components/ui/form.tsx`. |
| **@hookform/resolvers** | ^5.2.2 | Bridges validators (e.g. Zod) to RHF | `zodResolver` in `PostForm.tsx`, `SignInForm.tsx`, `SignUpForm.tsx`. |
| **zod** | ^4.1.12 | Schema validation | Same forms; `src/lib/validation/index.ts`. |

### shadcn-style UI primitives

Used together with copied components in `src/components/ui/` (see `components.json`).

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **@radix-ui/react-label** | ^2.1.7 | Accessible label | `components/ui/label.tsx`, `form.tsx`. |
| **@radix-ui/react-separator** | ^1.1.7 | Divider / separator | `components/ui/separator.tsx` (via `field.tsx`). |
| **@radix-ui/react-slot** | ^1.2.3 | `asChild` composition | `components/ui/button.tsx`, `form.tsx`. |
| **class-variance-authority** | ^0.7.1 | Variant-based `className` helpers (`cva`) | `button.tsx`, `field.tsx`, `input-group.tsx`. |
| **clsx** | ^2.1.1 | Conditional class names | `src/lib/utils.ts` (with `tailwind-merge` as `cn()`). |
| **tailwind-merge** | ^3.3.1 | Merges Tailwind classes safely | `src/lib/utils.ts`. |
| **lucide-react** | ^0.545.0 | Icons | `NotificationBellIcon`, sidebars, `FileUploader`, forms, `components/ui/sonner.tsx`, etc. |

### UX utilities

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **react-dropzone** | ^14.3.8 | File pick / drag-and-drop | `src/components/shared/FileUploader.tsx`. |
| **sonner** | ^2.0.7 | Toast notifications | `components/ui/sonner.tsx`; `toast()` in `PostForm`, `SignInForm`, `SignUpForm`. |
| **next-themes** | ^0.4.6 | Theme hook (`useTheme`) for light/dark | `components/ui/sonner.tsx` (toasts follow theme). |

### Styling (Tailwind v4)

| Package | Version | What it does | Where it shows up |
|--------|---------|----------------|-------------------|
| **tailwindcss** | ^4.1.14 | Tailwind engine | `src/global.css` (`@import "tailwindcss"`). |
| **@tailwindcss/vite** | ^4.1.14 | Vite plugin for Tailwind 4 | `vite.config.ts` (`tailwindcss()` in `plugins`). |

---

## Dev dependencies (`devDependencies`)

| Package | Role |
|--------|------|
| **vite** | Dev server & production build. |
| **@vitejs/plugin-react** | React + Fast Refresh for Vite. |
| **typescript** | Type-checking. |
| **@types/node**, **@types/react**, **@types/react-dom** | TypeScript typings. |
| **eslint**, **@eslint/js**, **typescript-eslint**, **globals** | Linting baseline. |
| **eslint-plugin-react-hooks**, **eslint-plugin-react-refresh** | React-specific lint rules. |
| **@tanstack/react-query-devtools** | React Query devtools (development only). |
| **tw-animate-css** | Animation utilities used with Tailwind setup. |

---

## Quick mental model

- **Appwrite** — users, profiles, storage, and related API calls.
- **Stream Feeds** — social feed data and React integration.
- **TanStack Query** — caching and mutations around async work.
- **RHF + Zod + resolvers** — forms with schema validation.
- **Radix + CVA + `cn()`** — accessible, variant-friendly UI building blocks (shadcn pattern).
