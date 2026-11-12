# SpendWise AI frontend

React and Vite frontend for SpendWise AI.

## Local development

```bash
npm ci
npm run dev
```

The app uses `http://localhost:5000/api` when `VITE_API_BASE_URL` is not set. To use another API, create `.env.local` from `.env.example` and set `VITE_API_BASE_URL` to the backend URL including `/api`.

## Vercel

Import this repository as a Vercel project. The project root is the repository root; `vercel.json` defines the Vite build, `dist` output, and SPA route fallback. Configure the Vercel environment variable `VITE_API_BASE_URL` as `https://spendwise-backend-am5k.onrender.com/api` for Production and Preview.
