import { initializeApp, type FirebaseApp } from "firebase/app";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signOut as fbSignOut, getIdTokenResult, type Auth, type User as FbUser,
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
    /* del custom claim "userId": el UUID del usuario en el IAM (con el que se
       guardan los establecimientos). cae al uid de firebase si aun no hay claim */
    userId: string;
    /* del custom claim "roles" */
    roles: string[];
}

/* arma la sesion leyendo los custom claims (userId + roles) del id token */
async function toSession(user: FbUser, forceRefresh = false): Promise<FirebaseSession> {
    const result = await getIdTokenResult(user, forceRefresh);
    const claimUserId = result.claims.userId as string | undefined;
    const claimRoles = (result.claims.roles as string[] | undefined) ?? [];
    return {
        uid: user.uid,
        idToken: result.token,
        email: user.email,
        userId: claimUserId ?? user.uid,
        roles: claimRoles,
    };
}

export async function firebaseSignUp(email: string, password: string): Promise<FirebaseSession> {
    const cred = await createUserWithEmailAndPassword(auth(), email, password);
    return toSession(cred.user);
}

export async function firebaseSignIn(email: string, password: string): Promise<FirebaseSession> {
    const cred = await signInWithEmailAndPassword(auth(), email, password);
    return toSession(cred.user);
}

export async function firebaseSignOut(): Promise<void> {
    if (_auth) await fbSignOut(_auth);
}

/*
 fuerza un id token nuevo desde firebase (getIdToken(true)).
 se usa despues del sign-up del backend: el IAM setea los custom claims
 (userId + roles) con setCustomUserClaims, pero el token que ya teniamos se
 emitio ANTES de eso y no los trae. sin refrescar, business/marketing rechazan
 (403 sin roles, o 500 porque el principal no es un UUID).
*/
export async function firebaseRefreshToken(): Promise<string | null> {
    if (!firebaseConfig.apiKey) return null;   // modo dev / sin firebase
    /* inicializa firebase si aun no se uso en esta sesion (ej. tras recargar la
       pagina, donde no hubo login) y espera a que restaure la sesion persistida,
       si no currentUser seria null y el refresh no traeria los claims nuevos */
    const a = auth();
    await a.authStateReady();
    const user = a.currentUser;
    if (!user) return null;
    return user.getIdToken(true);
}