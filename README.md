# Mood Pulse

Mood Pulse is a mobile-first React MVP for visualizing aggregated regional mood statistics in Japan.

It shows the current mood weather of each region without using geolocation, accounts, free-text comments, maps, or individual post feeds.

## Public URL

https://mood-pulse-five.vercel.app/

## Features

- Manual region selection
- Predefined mood button posting
- Regional mood ranking
- National mood ranking
- Top mood by region
- X/Twitter share text copy
- Firestore support
- localStorage fallback when Firebase config is missing

## Run locally

Install dependencies:

    npm install

Start the development server:

    npm run dev

The app runs without Firebase config by using localStorage for anonymous, aggregated demo data.

## Optional Firebase

Copy .env.example to .env.local and fill in the Vite Firebase variables.

When the required Firebase values are present, src/lib/postRepository.ts switches from localStorage to Firestore automatically.

Required variables:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## Build

Run:

    npm run build
