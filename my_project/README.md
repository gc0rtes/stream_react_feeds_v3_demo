# Instagram-style feed (Stream Feeds + Appwrite)

A social-style web app built with **React** and **Vite**: users sign up through **Appwrite**, while posts, feeds, reactions, bookmarks, and notifications are powered by **Stream Feeds**. The UI uses **Tailwind CSS v4** and **shadcn/ui**-style components.

---

## What you can do

### Account

- **Sign up** and **sign in** (Appwrite authentication).
- **Profile** — view a user profile by ID; **update profile** (name, bio, avatar, etc.).
- **Sign out** closes the Stream Feeds WebSocket connection and clears session state.

### Feeds & discovery

- **Home** — switch between feed views: **My feed**, **Timeline**, and **Posted** (your own activities), with infinite scroll / load more.
- **Community** — global community feed (`newGlobal` / community group).
- **Forums** — browse topic forums (e.g. sports, music, travel, food); join a forum feed, toggle grid vs feed layout, and read posts in that category.
- **Explore** — debounced **search** across activities, **topic filters**, and a browsable grid of posts; supports pagination.
- **People** — list users you **follow** via Stream and **unfollow** them.

### Posts

- **Create post** — text, optional **interest tags**, and **image uploads** (drag-and-drop).
- **Update post** and **delete** (owner actions on your content).
- **Post detail** — full view of one activity with images and engagement.

### Engagement

- **Like** and **bookmark** posts (Stream reactions / bookmarks); counts update with real-time feed behavior where applicable.
- **Saved** — grid of **bookmarked** activities with load-more.

### Notifications

- **Notifications** — aggregated activity list with relative timestamps; links to the relevant post. Unread state can surface in the nav (notification bell / badge).

### Layout

- **Responsive layout** — sidebar on larger screens, bottom bar on small screens for main navigation.

---

## Explore: “popular” ranking (reference)

The popular selector surfaces activities from feeds with **public** or **visible** visibility—not only feeds you follow. Popularity is computed as:

`activity.popularity = reactions + comments × 2 + bookmarks × 3 + shares × 3`

---

## Tech stack (short)

| Area | Technology |
|------|------------|
| App shell | Vite, React 19, React Router |
| Backend (users, files, profile data) | Appwrite |
| Social feed & real-time | Stream Feeds (`@stream-io/feeds-client`, `@stream-io/feeds-react-sdk`) |
| Client cache / mutations | TanStack Query |
| UI | Tailwind v4, shadcn/ui-style components, Lucide icons |

For a dependency-by-dependency map, see [`PACKAGE_DEPENDENCIES.md`](./PACKAGE_DEPENDENCIES.md).

---

## Run locally

1. Configure environment variables (e.g. `.env.local`) for Appwrite and Stream Feeds — same variables referenced in `AuthContext` and the Stream client setup.
2. `npm install`
3. `npm run dev`

Build: `npm run build` · Preview: `npm run preview`
