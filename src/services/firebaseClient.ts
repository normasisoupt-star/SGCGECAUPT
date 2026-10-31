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

export function initFirebase(): { app: FirebaseApp; auth: Auth; isConfigured: boolean } {
  try {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(OFFICIAL_FIREBASE_CONFIG);
    }
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, isConfigured: true };
  } catch (error) {
    console.error('Error al inicializar Firebase SGCUPT:', error);
    firebaseApp = getApp();
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, isConfigured: true };
  }
}

// Inicializar inmediatamente
initFirebase();

export function isFirebaseConfigured(): boolean {
  return true;
}

/**
 * Registro ultra-rápido en Firebase Authentication (sin bloqueos de Firestore)
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

  // Ejecutar registro con timeout de seguridad de 8 segundos
  const authPromise = createUserWithEmailAndPassword(auth, email, password);
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Firebase Auth.')), 8000)
  );

  const credential = await Promise.race([authPromise, timeoutPromise]);
  const user = credential.user;

  // Actualizar nombre visible en Firebase
  try {
    await updateProfile(user, {
      displayName: profileData.name,
      photoURL: profileData.avatar,
    });
  } catch (err) {
    console.warn('Aviso: no se pudo actualizar displayName:', err);
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

  return userProfile;
}

/**
 * Inicio de sesión ultra-rápido con correo y contraseña en Firebase Auth
 */
export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const auth = firebaseAuth || getAuth();

  const authPromise = signInWithEmailAndPassword(auth, email, password);
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Firebase Auth.')), 8000)
  );

  const credential = await Promise.race([authPromise, timeoutPromise]);
  const user = credential.user;

  // Buscar si el usuario ya tiene su perfil registrado en el almacenamiento local
  try {
    const rawUsers = typeof window !== 'undefined' ? localStorage.getItem('upt_sgc_users_v1') : null;
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      const existing = parsedUsers.find((u: any) => u.email?.toLowerCase() === (user.email || email).toLowerCase());
      if (existing) {
        return {
          ...existing,
          id: user.uid,
          name: user.displayName || existing.name,
          email: user.email || email,
        };
      }
    }
  } catch (e) {
    console.warn('Error recuperando perfil local:', e);
  }

  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Funcionario UPT',
    email: user.email || email,
    charge: 'Funcionario SGC UPT',
    department: 'Oficina Institucional',
    officeName: 'Oficina Institucional',
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
