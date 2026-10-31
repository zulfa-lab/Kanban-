import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// Read config safely from Vite environment variables
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is actually configured with valid non-placeholder keys
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== '' && 
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization error, defaulting to Demo mode:', error);
  }
}

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  firebaseConfig,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
};

/**
 * Diagnostic helper to check real-time Cloud Firestore status
 */
export const checkFirestoreStatus = async () => {
  if (!isFirebaseConfigured || !db) {
    return {
      status: 'sandbox',
      label: 'Local Sandbox Mode',
      details: 'Firebase keys belum disetel di .env. Menggunakan Local Storage & BroadcastChannel.',
      projectId: firebaseConfig.projectId
    };
  }
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents?key=${firebaseConfig.apiKey}`
    );
    if (res.status === 404) {
      return {
        status: 'not_created',
        label: 'Database Belum Dibuat di Firebase Console',
        details: 'API Cloud Firestore belum diaktifkan atau database belum dibuat di project Firebase ini.',
        projectId: firebaseConfig.projectId
      };
    }
    if (res.status === 403) {
      return {
        status: 'permission_denied',
        label: 'Izin Ditolak (Rules Perlu Diupdate)',
        details: 'Database Firestore sudah aktif, namun Security Rules menolak akses baca/tulis.',
        projectId: firebaseConfig.projectId
      };
    }
    if (res.ok) {
      return {
        status: 'connected',
        label: 'Firebase Cloud Connected & Synced',
        details: 'Koneksi ke Cloud Firestore aktif dan data tersinkronisasi real-time.',
        projectId: firebaseConfig.projectId
      };
    }
    return {
      status: 'warning',
      label: `Status HTTP ${res.status}`,
      details: 'Mengecek respon server Firestore...',
      projectId: firebaseConfig.projectId
    };
  } catch (err) {
    return {
      status: 'offline',
      label: 'Offline / Jaringan Terputus',
      details: 'Tidak dapat menghubungi server Firebase. Menggunakan penyimpanan lokal.',
      projectId: firebaseConfig.projectId
    };
  }
};

