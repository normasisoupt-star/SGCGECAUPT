import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { UserProfile, UserRole, ProcessLevel0 } from '../types';
import { getOrganizationUnitById, resolveUserOrganizationUnit, resolveUserSecondaryUnit, getCombinedUserProceduresAndProcesses } from '../data/organizationHierarchy';
import { isUserEmailRevoked, removeEmailFromRevoked } from './storage';

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
let firebaseDb: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore | null; isConfigured: boolean } {
  try {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(OFFICIAL_FIREBASE_CONFIG);
    }
    firebaseAuth = getAuth(firebaseApp);
    firebaseAuth.languageCode = 'es';
    try {
      firebaseDb = getFirestore(firebaseApp);
    } catch {
      firebaseDb = null;
    }
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, isConfigured: true };
  } catch (error) {
    console.error('Error al inicializar Firebase SGCUPT:', error);
    firebaseApp = getApp();
    firebaseAuth = getAuth(firebaseApp);
    firebaseAuth.languageCode = 'es';
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, isConfigured: true };
  }
}

initFirebase();

export function isFirebaseConfigured(): boolean {
  return true;
}

function encodeEmailDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
}

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T | null> {
  try {
    const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
    return await Promise.race([promise, timer]);
  } catch {
    return null;
  }
}

/**
 * Sincroniza la ficha del funcionario registrado en Firestore (si está habilitado)
 */
export async function saveUserToCloudRegistry(profile: UserProfile): Promise<void> {
  if (!firebaseDb || !profile.email) return;
  const docId = encodeEmailDocId(profile.email);
  await withTimeout(
    setDoc(doc(firebaseDb, 'sgc_registered_users', docId), {
      ...profile,
      isCustomRegistered: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  );
  // Si estaba en lista de revocados, limpiarlo al registrarse nuevamente
  await withTimeout(deleteDoc(doc(firebaseDb, 'sgc_revoked_users', docId)));
}

/**
 * Revoca / elimina el registro de un usuario en la nube para bloquear su acceso
 */
export async function revokeUserInCloud(email: string, adminName: string): Promise<void> {
  if (!firebaseDb || !email) return;
  const docId = encodeEmailDocId(email);
  await withTimeout(deleteDoc(doc(firebaseDb, 'sgc_registered_users', docId)));
  await withTimeout(
    setDoc(doc(firebaseDb, 'sgc_revoked_users', docId), {
      email: email.trim().toLowerCase(),
      revokedBy: adminName,
      revokedAt: new Date().toISOString(),
    })
  );
}

/**
 * Reasigna la oficina/área de un usuario en la nube
 */
export async function reassignUserUnitInCloud(email: string, newUnitId: string): Promise<void> {
  if (!firebaseDb || !email) return;
  const unit = getOrganizationUnitById(newUnitId);
  if (!unit) return;
  const docId = encodeEmailDocId(email);
  const existingSnap = await withTimeout(getDoc(doc(firebaseDb, 'sgc_registered_users', docId)), 2000);
  const existingData = existingSnap && existingSnap.exists() ? (existingSnap.data() as UserProfile) : undefined;
  const secUnit = resolveUserSecondaryUnit(existingData);
  const cleanSec = secUnit && secUnit.id !== unit.id ? secUnit : undefined;
  const combined = getCombinedUserProceduresAndProcesses(unit, cleanSec);

  await withTimeout(
    setDoc(doc(firebaseDb, 'sgc_registered_users', docId), {
      unitId: unit.id,
      secondaryUnitId: cleanSec ? cleanSec.id : '',
      secondaryOfficeName: cleanSec ? cleanSec.displayName : '',
      organName: unit.organName,
      areaName: unit.areaName || '',
      department: unit.organName,
      officeName: unit.displayName,
      procedureCodes: combined.procedureCodes,
      processCodes: combined.processCodes,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  );
}

/**
 * Asigna o remueve una segunda dependencia (oficina/área/facultad) al usuario en la nube (exclusivo Administrador)
 */
export async function assignUserSecondaryUnitInCloud(email: string, secondaryUnitId: string): Promise<void> {
  if (!firebaseDb || !email) return;
  const docId = encodeEmailDocId(email);
  const existingSnap = await withTimeout(getDoc(doc(firebaseDb, 'sgc_registered_users', docId)), 2000);
  const existingData = existingSnap && existingSnap.exists() ? (existingSnap.data() as UserProfile) : undefined;
  const primaryUnit = existingData ? (getOrganizationUnitById(existingData.unitId) || resolveUserOrganizationUnit(existingData)) : undefined;
  const secUnit = secondaryUnitId ? getOrganizationUnitById(secondaryUnitId) : undefined;
  const cleanSec = secUnit && secUnit.id !== primaryUnit?.id ? secUnit : undefined;
  const combined = getCombinedUserProceduresAndProcesses(primaryUnit, cleanSec, existingData?.procedureCodes, existingData?.processCodes);

  await withTimeout(
    setDoc(doc(firebaseDb, 'sgc_registered_users', docId), {
      secondaryUnitId: cleanSec ? cleanSec.id : '',
      secondaryOfficeName: cleanSec ? cleanSec.displayName : '',
      procedureCodes: combined.procedureCodes,
      processCodes: combined.processCodes,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  );
}

/**
 * Obtiene todos los usuarios registrados y correos revocados desde la nube
 */
export async function fetchCloudRegisteredUsers(): Promise<{ users: UserProfile[]; revokedEmails: string[] }> {
  if (!firebaseDb) return { users: [], revokedEmails: [] };
  const users: UserProfile[] = [];
  const revokedEmails: string[] = [];

  const regSnap = await withTimeout(getDocs(collection(firebaseDb, 'sgc_registered_users')), 3000);
  if (regSnap) {
    regSnap.forEach((d) => {
      const data = d.data() as UserProfile;
      if (data && data.email) {
        users.push(data);
      }
    });
  }

  const revSnap = await withTimeout(getDocs(collection(firebaseDb, 'sgc_revoked_users')), 3000);
  if (revSnap) {
    revSnap.forEach((d) => {
      const data = d.data() as { email?: string };
      if (data?.email) {
        revokedEmails.push(data.email.trim().toLowerCase());
      }
    });
  }

  return { users, revokedEmails };
}

/**
 * Registro ultra-rápido en Firebase Authentication + etiqueta de Unidad Jerárquica
 */
export async function registerWithFirebase(
  email: string,
  password: string,
  profileData: {
    name: string;
    charge: string;
    department: string;
    officeName?: string;
    unitId?: string;
    organName?: string;
    areaName?: string;
    procedureCodes?: string[];
    role: UserRole;
    processCodes?: ProcessLevel0[];
    avatar?: string;
  }
): Promise<UserProfile> {
  const auth = firebaseAuth || getAuth();
  const cleanEmail = email.trim().toLowerCase();
  removeEmailFromRevoked(cleanEmail);

  const authPromise = createUserWithEmailAndPassword(auth, cleanEmail, password);
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Firebase Auth.')), 8000)
  );

  const credential = await Promise.race([authPromise, timeoutPromise]);
  const user = credential.user;

  const unitTag = profileData.unitId || 'opla';
  const encodedMeta = profileData.role === 'geca'
    ? 'role:geca|unit:admin'
    : `unit:${unitTag}|role:${profileData.role}|charge:${encodeURIComponent(profileData.charge || 'Funcionario')}`;

  try {
    await updateProfile(user, {
      displayName: profileData.name,
      photoURL: encodedMeta,
    });
  } catch (err) {
    console.warn('Aviso: no se pudo actualizar displayName:', err);
  }

  const nowStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5);
  const resolvedUnit = getOrganizationUnitById(profileData.unitId) || resolveUserOrganizationUnit(profileData);

  const userProfile: UserProfile = {
    id: user.uid,
    name: profileData.name,
    email: user.email || cleanEmail,
    charge: profileData.charge,
    department: resolvedUnit ? resolvedUnit.organName : profileData.department,
    officeName: resolvedUnit ? resolvedUnit.displayName : (profileData.officeName || profileData.department),
    unitId: resolvedUnit?.id || profileData.unitId,
    organName: resolvedUnit?.organName || profileData.organName,
    areaName: resolvedUnit?.areaName || profileData.areaName,
    procedureCodes: resolvedUnit ? resolvedUnit.consolidatedProcedures : (profileData.procedureCodes || []),
    role: profileData.role,
    processCodes: resolvedUnit ? resolvedUnit.processCodes : (profileData.processCodes || []),
    registeredAt: nowStr,
    isCustomRegistered: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  // Guardar en Firestore sin bloquear
  saveUserToCloudRegistry(userProfile).catch(() => {});

  return userProfile;
}

/**
 * Inicio de sesión ultra-rápido con correo y contraseña en Firebase Auth
 */
export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const auth = firebaseAuth || getAuth();
  const cleanEmail = email.trim().toLowerCase();

  // 1. Verificar si el correo fue eliminado/revocado localmente por el Administrador
  if (isUserEmailRevoked(cleanEmail)) {
    throw new Error('Su registro institucional fue eliminado o revocado por el Administrador del Sistema porque la oficina asignada no le corresponde.');
  }

  const authPromise = signInWithEmailAndPassword(auth, cleanEmail, password);
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Firebase Auth.')), 8000)
  );

  const credential = await Promise.race([authPromise, timeoutPromise]);
  const user = credential.user;

  // 2. Verificar si fue revocado en la nube (Firestore)
  if (firebaseDb) {
    const revDoc = await withTimeout(getDoc(doc(firebaseDb, 'sgc_revoked_users', encodeEmailDocId(cleanEmail))), 2000);
    if (revDoc && revDoc.exists()) {
      await signOut(auth);
      throw new Error('Su registro institucional fue eliminado o revocado por el Administrador del Sistema porque la oficina asignada no le corresponde.');
    }
  }

  // 3. Verificación criptográfica SHA-256 para el propietario Administrador del Sistema
  const computeSha = async (str: string) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const emailHashHex = await computeSha((user.email || cleanEmail).trim().toLowerCase());
  const isOwnerAdmin = emailHashHex === '6883e3e5753f7ccd55ae6cd6974a540b0826dc132e48f0196f459a889526ae4b';

  if (isOwnerAdmin) {
    return {
      id: user.uid,
      name: user.displayName || 'Kristhian Conde Zegarra',
      email: user.email || cleanEmail,
      charge: 'Administrador del Sistema',
      department: 'Administrador del Sistema',
      officeName: 'Administrador del Sistema',
      role: 'geca',
      processCodes: ['PE.01', 'PE.02', 'PE.03', 'PE.04', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.02', 'PS.03', 'PS.04', 'PS.05', 'PS.06'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    };
  }

  // 4. Intentar recuperar desde Firestore por si el Administrador reasignó su oficina o le asignó 2.ª dependencia
  if (firebaseDb) {
    const cloudDoc = await withTimeout(getDoc(doc(firebaseDb, 'sgc_registered_users', encodeEmailDocId(cleanEmail))), 2000);
    if (cloudDoc && cloudDoc.exists()) {
      const cloudProfile = cloudDoc.data() as UserProfile;
      const unit = getOrganizationUnitById(cloudProfile.unitId) || resolveUserOrganizationUnit(cloudProfile);
      const secUnit = resolveUserSecondaryUnit(cloudProfile);
      const cleanSec = secUnit && secUnit.id !== unit?.id ? secUnit : undefined;
      const combined = getCombinedUserProceduresAndProcesses(unit, cleanSec, cloudProfile.procedureCodes, cloudProfile.processCodes);
      return {
        ...cloudProfile,
        id: user.uid,
        name: user.displayName || cloudProfile.name,
        email: user.email || cleanEmail,
        unitId: unit?.id || cloudProfile.unitId,
        secondaryUnitId: cleanSec?.id,
        secondaryOfficeName: cleanSec?.displayName,
        organName: unit?.organName || cloudProfile.organName,
        areaName: unit?.areaName || cloudProfile.areaName,
        department: unit ? unit.organName : cloudProfile.department,
        officeName: unit ? unit.displayName : (cloudProfile.officeName || cloudProfile.department),
        procedureCodes: combined.procedureCodes,
        processCodes: combined.processCodes,
      };
    }
  }

  // 5. Extraer unidad desde photoURL de Firebase Auth (unit:xxx|role:yyy|charge:zzz)
  const photoMeta = user.photoURL || '';
  let parsedUnitId: string | undefined;
  let parsedRole: UserRole = 'colaborador';
  let parsedCharge = 'Funcionario Institucional';

  if (photoMeta.includes('unit:') || photoMeta.includes('role:')) {
    const parts = photoMeta.split('|');
    for (const part of parts) {
      if (part.startsWith('unit:')) parsedUnitId = part.replace('unit:', '').trim();
      if (part.startsWith('role:')) parsedRole = part.replace('role:', '').trim() as UserRole;
      if (part.startsWith('charge:')) {
        try {
          parsedCharge = decodeURIComponent(part.replace('charge:', ''));
        } catch {
          parsedCharge = part.replace('charge:', '');
        }
      }
    }
  }

  // Buscar también en el almacenamiento local por si hay más datos
  try {
    const rawUsers = typeof window !== 'undefined' ? localStorage.getItem('upt_sgc_users_v1') : null;
    if (rawUsers) {
      const parsedUsers: UserProfile[] = JSON.parse(rawUsers);
      const existing = parsedUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        const unit = getOrganizationUnitById(existing.unitId || parsedUnitId) || resolveUserOrganizationUnit(existing);
        const secUnit = resolveUserSecondaryUnit(existing);
        const cleanSec = secUnit && secUnit.id !== unit?.id ? secUnit : undefined;
        const combined = getCombinedUserProceduresAndProcesses(unit, cleanSec, existing.procedureCodes, existing.processCodes);
        return {
          ...existing,
          id: user.uid,
          name: user.displayName || existing.name,
          email: user.email || cleanEmail,
          unitId: unit?.id || existing.unitId,
          secondaryUnitId: cleanSec?.id,
          secondaryOfficeName: cleanSec?.displayName,
          organName: unit?.organName || existing.organName,
          areaName: unit?.areaName || existing.areaName,
          department: unit ? unit.organName : existing.department,
          officeName: unit ? unit.displayName : (existing.officeName || existing.department),
          procedureCodes: combined.procedureCodes,
          processCodes: combined.processCodes,
        };
      }
    }
  } catch {
    // Continuar con unidad de photoURL
  }

  const unit = getOrganizationUnitById(parsedUnitId) || getOrganizationUnitById('opla')!;
  const builtProfile: UserProfile = {
    id: user.uid,
    name: user.displayName || cleanEmail.split('@')[0].replace(/[._]/g, ' '),
    email: user.email || cleanEmail,
    charge: parsedCharge !== 'Funcionario Institucional' ? parsedCharge : unit.defaultCharge,
    department: unit.organName,
    officeName: unit.displayName,
    unitId: unit.id,
    organName: unit.organName,
    areaName: unit.areaName,
    procedureCodes: unit.consolidatedProcedures,
    role: parsedRole,
    processCodes: unit.processCodes,
    isCustomRegistered: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  // Guardar también en Firestore cuando un usuario antiguo de Firebase Auth inicia sesión
  saveUserToCloudRegistry(builtProfile).catch(() => {});

  return builtProfile;
}

export async function resetPasswordWithFirebase(email: string): Promise<void> {
  const auth = firebaseAuth || getAuth();
  auth.languageCode = 'es';
  const cleanEmail = email.trim().toLowerCase();

  const sendReset = async () => {
    try {
      await sendPasswordResetEmail(auth, cleanEmail, {
        url: 'https://normasisoupt-star.github.io/SGCGECAUPT/',
        handleCodeInApp: false,
      });
    } catch (err: any) {
      if (
        err?.code === 'auth/unauthorized-continue-uri' ||
        err?.code === 'auth/invalid-continue-uri' ||
        err?.code === 'auth/missing-continue-uri'
      ) {
        await sendPasswordResetEmail(auth, cleanEmail);
      } else {
        throw err;
      }
    }
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Firebase Auth.')), 8000)
  );
  await Promise.race([sendReset(), timeoutPromise]);
}

export async function verifyResetCodeWithFirebase(oobCode: string): Promise<string> {
  const auth = firebaseAuth || getAuth();
  auth.languageCode = 'es';
  return await verifyPasswordResetCode(auth, oobCode);
}

export async function confirmNewPasswordWithFirebase(oobCode: string, newPassword: string): Promise<void> {
  const auth = firebaseAuth || getAuth();
  auth.languageCode = 'es';
  await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function logoutFromFirebase(): Promise<void> {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, callback);
}
