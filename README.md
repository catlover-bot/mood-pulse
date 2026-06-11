# Mood Pulse

Mood Pulse is a mobile-first React MVP for visualizing aggregated regional mood statistics in Japan. It does not use geolocation, accounts, free-text comments, maps, or individual post feeds.

## Run locally

```bash
npm install
npm run dev
```

The app runs without Firebase config by using localStorage for anonymous, aggregated demo data.

## Optional Firebase

Copy `.env.example` to `.env.local` and fill in the Vite Firebase variables. When the required Firebase values are present, `src/lib/postRepository.ts` switches from localStorage to Firestore automatically.

```bash
npm run build
```

## Deploy

Public URL:

https://mood-pulse-five.vercel.app/


## Public URL

https://mood-pulse-five.vercel.app/

