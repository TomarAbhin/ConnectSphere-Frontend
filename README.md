# ConnectSphere Frontend

React frontend for ConnectSphere. It is built with Vite, React Router, TanStack Query, Zustand, Axios, Tailwind CSS, and Vitest.

## What This App Includes

- Login and registration
- Feed and post details
- Post creation, editing, visibility labels, and reactions
- Comments and replies
- Profiles and profile editing
- Explore, search, hashtags, and trending content
- Follow suggestions and follow actions
- Notifications
- Stories and media display
- Admin dashboard, user moderation, post moderation, and report review

## Requirements

- Node.js 18+ or 20+
- npm
- ConnectSphere API gateway running on `http://localhost:8080`

## Setup

From this directory:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server on port `3000` |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |

## API Configuration

The Axios client is configured in:

```text
src/api/axiosInstance.js
```

Base URLs are defined in:

```text
src/utils/constants.js
```

Current defaults:

```js
export const BASE_URL = 'http://localhost:8080/api/v1';
export const MEDIA_SERVICE_URL = 'http://localhost:8087';
```

Most API calls go through the gateway at `BASE_URL`. Media file URLs may use the media service URL directly.

## Authentication Flow

- `src/store/authStore.js` stores the current user, access token, and refresh token.
- `src/api/axiosInstance.js` attaches the access token to authenticated requests.
- On a `401`, the Axios response interceptor attempts `/auth/refresh`.
- If refresh fails, the store logs the user out.
- Protected pages use `src/components/layout/ProtectedRoute.jsx`.

## Source Layout

```text
src/
  api/          API wrappers and Axios instance
  components/   Shared UI, layout, post, comment, and user components
  hooks/        Feature hooks such as auth, posts, notifications
  pages/        Route-level pages
  pages/admin/  Admin dashboard pages
  pages/auth/   Login and registration
  store/        Zustand stores
  test/         Vitest setup
  utils/        Constants, date formatting, media helpers
```

## Main Routes

| Route | Page |
| --- | --- |
| `/login` | Login |
| `/register` | Register |
| `/feed` | Main feed |
| `/explore` | Explore |
| `/post/:id` | Post detail |
| `/profile/:userId` | User profile |
| `/profile/edit` | Edit profile |
| `/search` | Search |
| `/hashtag/:tag` | Hashtag posts |
| `/notifications` | Notifications |
| `/stories` | Stories |
| `/admin` | Admin dashboard |
| `/admin/users` | Admin users |
| `/admin/reports` | Admin reports |
| `/admin/posts` | Admin posts |

## Docker

The frontend has a multi-stage Dockerfile:

1. Build with Node.
2. Serve static assets with Nginx.

From the parent `connectsphere` directory, run it with the Compose frontend profile:

```powershell
docker compose --profile frontend up -d --build frontend
```

Open:

```text
http://localhost:3000
```

## Testing

Run all frontend tests once:

```powershell
npm run test:run
```

Run tests in watch mode:

```powershell
npm run test
```

## Troubleshooting

If the app shows repeated `401` responses after backend changes, clear the old browser auth state or log out and log in again.

If API calls fail with network errors, make sure the API gateway is running on `http://localhost:8080`.

If media does not load, check that `media-service` is running on `http://localhost:8087` and that uploaded files exist in the backend upload directory.

If Vite cannot start on port `3000`, stop the process using that port or change `server.port` in `vite.config.js`.
