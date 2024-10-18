import { doc, DocumentData, DocumentReference, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export async function googleSignIn() {
    return await signInWithPopup(auth, googleProvider);
}

export async function createUser(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function addDataToCollection(collectionName: string, userUid: string, userData: Record<string, unknown>) {
    const docRef: DocumentReference<DocumentData, DocumentData> = doc(db, collectionName, userUid);
    await setDoc(docRef, userData);
}

export async function defaultSignIn(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
}