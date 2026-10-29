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
  measurementId?: string;
}

// Credenciales Oficiales del Proyecto Firebase SGCUPT
export const OFFICIAL_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCyekDE7KRvJEPiaDuUiPdxVC9Y1jDxoaQ",
  authDomain: "sgcupt.firebaseapp.com",
  projectId: "sgcupt",
  storageBucket: "sgcupt.firebasestorage.app",
  messagingSenderId: "614789838002",
  appId: "1:614789838002:web:e420b9be9279fcf2a3c5ab",
  measurementId: "G-5R508PTCF8"
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp; auth: Auth; isConfigured: boolean } {
  try {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(OFFICIAL_FIREBASE_CONFIG);
    }
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, isConfigured: true };
  } catch (error) {
    console.error('Error al inicializar Firebase SGCUPT:', error);
    // Si ya fue inicializado
    firebaseApp = getApp();
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, isConfigured: true };
  }
}

// Inicializar inmediatamente
initFirebase();

export function isFirebaseConfigured(): boolean {
  return true; // Configurado nativamente con el proyecto SGCUPT
}

/**
 * Registro de un nuevo funcionario en Firebase Auth + Firestore
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
  const auth = firebaseAuth || getAuth();

  const credential = await createUserWithEmailAndPassword(auth, email, password);
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

  // Guardar datos institucionales extendidos en Firestore
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
      console.warn('Aviso: Firestore en modo restringido; perfil preservado en sesión local:', fsErr);
    }
  }

  return userProfile;
}

/**
 * Inicio de sesión con correo institucional y contraseña en Firebase Auth
 */
export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const auth = firebaseAuth || getAuth();

  const credential = await signInWithEmailAndPassword(auth, email, password);
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
          name: data.name || user.displayName || user.email?.split('@')[0] || 'Funcionario UPT',
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
      console.warn('Lectura Firestore:', fsErr);
    }
  }

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
  const auth = firebaseAuth || getAuth();
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Escuchador de estado de autenticación
 */
export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void): (() => void) {
  const auth = firebaseAuth || getAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
