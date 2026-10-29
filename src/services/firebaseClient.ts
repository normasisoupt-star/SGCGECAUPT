import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Firestore 
} from 'firebase/firestore';
import { UserProfile, UserRole, ProcessLevel0 } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY_FIREBASE = 'upt_iso21001_firebase_config';

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  if (typeof window === 'undefined') return null;

  // 1. Verificar variables de entorno Vite
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 2. Verificar localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error leyendo config de Firebase de localStorage:', e);
  }

  return null;
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(customConfig?: FirebaseConfig): { app: FirebaseApp | null; auth: Auth | null; isConfigured: boolean } {
  const config = customConfig || getStoredFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, auth: null, isConfigured: false };
  }

  try {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(config);
    }
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, isConfigured: true };
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    return { app: null, auth: null, isConfigured: false };
  }
}

// Inicializar al cargar módulo
initFirebase();

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseApp && firebaseAuth);
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
    initFirebase(config);
    return true;
  } catch (e) {
    console.error('Error guardando configuración de Firebase:', e);
    return false;
  }
}

export function clearFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_FIREBASE);
  firebaseApp = null;
  firebaseAuth = null;
  firestoreDb = null;
}

/**
 * Registro de un nuevo usuario en Firebase Auth + Firestore
 */
export async function registerWithFirebase(
  email: string,
  password: string,
  profileData: {
    name: string;
    charge: string;
    department: string;
    officeName?: string;
    role: UserRole;
    processCodes?: ProcessLevel0[];
    avatar?: string;
  }
): Promise<UserProfile> {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth no está configurado. Por favor ingrese las credenciales de Firebase del SGC.');
  }

  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const user = credential.user;

  // Actualizar nombre visible en Auth
  try {
    await updateProfile(user, {
      displayName: profileData.name,
      photoURL: profileData.avatar,
    });
  } catch (err) {
    console.warn('No se pudo actualizar el perfil básico de Firebase:', err);
  }

  const userProfile: UserProfile = {
    id: user.uid,
    name: profileData.name,
    email: user.email || email,
    charge: profileData.charge,
    department: profileData.department,
    officeName: profileData.officeName || profileData.department,
    role: profileData.role,
    processCodes: profileData.processCodes || [],
    avatar: profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  // Guardar datos institucionales extendidos en Firestore si está disponible
  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', user.uid);
      await setDoc(userRef, {
        ...userProfile,
        createdAt: new Date().toISOString(),
        institution: 'Universidad Privada de Tacna',
        sgcStatus: 'activo',
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Aviso: No se pudo escribir en Firestore (puede requerir reglas de seguridad), los datos se preservan localmente:', fsErr);
    }
  }

  return userProfile;
}

/**
 * Inicio de sesión con correo y contraseña en Firebase Auth
 */
export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth no está configurado. Ingrese las credenciales de Firebase del SGC.');
  }

  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const user = credential.user;

  // Intentar leer perfil completo desde Firestore
  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: user.uid,
          name: data.name || user.displayName || user.email?.split('@')[0] || 'Usuario UPT',
          email: user.email || email,
          charge: data.charge || 'Funcionario SGC',
          department: data.department || 'Oficina Institucional',
          officeName: data.officeName || data.department || 'Oficina Institucional',
          role: data.role || 'colaborador',
          processCodes: data.processCodes || ['PE.02'],
          avatar: data.avatar || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
      }
    } catch (fsErr) {
      console.warn('No se pudo leer de Firestore, utilizando datos básicos de sesión:', fsErr);
    }
  }

  // Fallback si no está en Firestore: construir perfil institucional
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Funcionario UPT',
    email: user.email || email,
    charge: 'Funcionario SGC UPT',
    department: 'Oficina de Gestión de la Calidad',
    officeName: 'Oficina de Gestión de la Calidad',
    role: 'colaborador',
    processCodes: ['PE.02'],
    avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };
}

/**
 * Cierre de sesión en Firebase
 */
export async function logoutFirebase(): Promise<void> {
  if (firebaseAuth) {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.error('Error al cerrar sesión en Firebase:', err);
    }
  }
}

/**
 * Escuchador de estado de autenticación de Firebase
 */
export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void): (() => void) {
  if (!firebaseAuth) {
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}
