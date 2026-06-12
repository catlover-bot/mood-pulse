# Mood Pulse

https://mood-pulse-five.vercel.app/

Mood Pulse is a web app that visualizes the current "mood/weather" of each region. People manually choose a prefecture and a predefined mood/state, and the app shows aggregated regional and national mood statistics.

## Current Features

- 47 Japanese prefectures
- 24 predefined mood/state buttons
- Regional ranking
- National ranking
- Region constellation
- Immersive mood aura UI
- Submit ripple
- 30-minute client-side cooldown
- OGP image
- Basic PWA installability
- Firestore support
- localStorage fallback
- Firebase lazy loading

## PWA

Mood Pulse can be added to a mobile home screen from supported browsers. No native app store install is required.

## Privacy Design

Mood Pulse is designed as an aggregated check-in app, not a personal feed.

- No login
- No geolocation
- No free-text comments
- No individual post feed
- No exact location display
- Stores selected region, selected mood/state, timestamp, and anonymous clientId

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Firebase Setup

The app runs without Firebase config by using localStorage fallback. To enable Firestore, create `.env.local` with these Vite variables:

```txt
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firestore Rules must be copied from `firestore.rules` into Firebase Console before production writes are allowed.
