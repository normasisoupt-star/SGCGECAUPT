declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(options: Record<string, any>, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  export interface UserCredential {
    user: User;
  }
  export interface Auth {
    currentUser: User | null;
  }
  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;
  export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    [key: string]: any;
  }
  export interface DocumentReference {
    id: string;
  }
  export interface DocumentSnapshot {
    exists(): boolean;
    data(): any;
  }
  export function getFirestore(app?: any): Firestore;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function setDoc(reference: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void>;
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
}
