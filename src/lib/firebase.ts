import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

// Try to load custom configuration from localStorage if available
let localConfig: any = null;
try {
  const stored = localStorage.getItem('taqwa_firebase_config');
  if (stored) {
    localConfig = JSON.parse(stored);
  }
} catch (e) {
  console.error('Error reading firebase config from localStorage:', e);
}

// Merge configuration: custom localConfig > live appletConfig > environment variables
const firebaseConfig = {
  apiKey: localConfig?.apiKey || appletConfig?.apiKey || env.VITE_FIREBASE_API_KEY,
  authDomain: localConfig?.authDomain || appletConfig?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: localConfig?.projectId || appletConfig?.projectId || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: localConfig?.storageBucket || appletConfig?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: localConfig?.messagingSenderId || appletConfig?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: localConfig?.appId || appletConfig?.appId || env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: localConfig?.firestoreDatabaseId || appletConfig?.firestoreDatabaseId
};

export let isFirebaseConfigured = false;
export let app: any = null;
export let auth: any = null;
export let db: any = null;

// Only initialize Firebase if apiKey is present, non-empty, and looks like a valid key format
const rawApiKey = firebaseConfig.apiKey;
const cleanApiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

const isPlaceholderKey = 
  cleanApiKey === '' ||
  cleanApiKey.toLowerCase().includes('placeholder') ||
  cleanApiKey.toLowerCase().includes('your_') ||
  cleanApiKey.toLowerCase().includes('api_key');

const isValidKey = 
  cleanApiKey !== '' && 
  cleanApiKey.startsWith('AIza') &&
  cleanApiKey.length >= 30 &&
  !isPlaceholderKey;

if (isValidKey) {
  try {
    // Update config with cleaned api key
    firebaseConfig.apiKey = cleanApiKey;
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // CRITICAL: The app will break if getFirestore is called incorrectly
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    isFirebaseConfigured = true;
  } catch (err) {
    console.error('Firebase initialization failed:', err);
    isFirebaseConfigured = false;
  }
} else {
  console.log('Firebase is not configured or has empty/placeholder values. Demo Auth Mode active.');
}

