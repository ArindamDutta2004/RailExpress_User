import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, Messaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCmQpRVWEK_x2HV339VXOvPgdaLRa7Eszs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'railxpress-web.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'railxpress-web',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'railxpress-web.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '6824901297',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:6824901297:web:0724676a32b736d5058090',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VD8Q582GTM',
};

export const firebaseVapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BGKjbWFE1TzCLoQche5WO6o-r2AO4-L09hL_13F4aR_YseSyBYZwi9fFUbyBmolBkzKF28eBgL7UPgtr-gPOZsU';

export const firebaseApp = initializeApp(firebaseConfig);

let messagingPromise: Promise<Messaging | null> | null = null;

export const getFirebaseMessaging = () => {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch((err) => {
        console.error('[firebase] Messaging support check failed', err);
        return null;
      });
  }
  return messagingPromise;
};

export const requestFcmToken = async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  return getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });
};

export const listenForForegroundMessages = async (
  callback: (payload: {
    notification?: { title?: string; body?: string };
    data?: Record<string, string>;
  }) => void
) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => undefined;
  return onMessage(messaging, callback);
};
