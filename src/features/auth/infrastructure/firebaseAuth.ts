import { initializeApp, type FirebaseApp } from "firebase/app";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signOut as fbSignOut, type Auth,
} from "firebase/auth";

/*
 login y registro con firebase, devuelve el id token
 la config va por entorno (VITE_FIREBASE_*)
*/
const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

/* dice si hay config de firebase -> si no, el repo usa un modo dev sin firebase */
export function isFirebaseConfigured(): boolean {
    return !!firebaseConfig.apiKey;
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

/* crea la app solo la primera vez que se usa */
function auth(): Auth {
    if (!_auth) {
        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase no esta configurado");
        }
        _app = initializeApp(firebaseConfig);
        _auth = getAuth(_app);
    }
    return _auth;
}

export interface FirebaseSession {
    uid: string;
    idToken: string;
    email: string | null;
}

export async function firebaseSignUp(email: string, password: string): Promise<FirebaseSession> {
    const cred = await createUserWithEmailAndPassword(auth(), email, password);
    return { uid: cred.user.uid, idToken: await cred.user.getIdToken(), email: cred.user.email };
}

export async function firebaseSignIn(email: string, password: string): Promise<FirebaseSession> {
    const cred = await signInWithEmailAndPassword(auth(), email, password);
    return { uid: cred.user.uid, idToken: await cred.user.getIdToken(), email: cred.user.email };
}

export async function firebaseSignOut(): Promise<void> {
    if (_auth) await fbSignOut(_auth);
}