# SpendWise AI frontend

React and Vite frontend for SpendWise AI.

## Local development

```bash
npm ci
npm run dev
```

The app defaults to the deployed Render API (`https://spendwise-backend-am5k.onrender.com/api`). For local backend development, create `.env.local` and set `VITE_API_BASE_URL=http://localhost:5000/api`. The request timeout is 65 seconds to allow a sleeping Render instance to wake.

## Vercel

Import this repository as a Vercel project. The project root is the repository root; `vercel.json` defines the Vite build, `dist` output, and SPA route fallback. Configure the Vercel environment variable `VITE_API_BASE_URL` as `https://spendwise-backend-am5k.onrender.com/api` for Production and Preview.
