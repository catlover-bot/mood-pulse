import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let firebaseDbPromise: Promise<Firestore> | null = null;

export async function getFirebaseDb(): Promise<Firestore | null> {
  if (!hasFirebaseConfig) {
    return null;
  }

  firebaseDbPromise ??= Promise.all([getFirebaseApp(), import("firebase/firestore/lite")]).then(
    ([app, { getFirestore }]) => getFirestore(app),
  );

  return firebaseDbPromise;
}

async function getFirebaseApp(): Promise<FirebaseApp> {
  firebaseAppPromise ??= import("firebase/app").then(({ getApps, initializeApp }) => {
    return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  });

  return firebaseAppPromise;
}
