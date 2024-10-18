import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentData, DocumentReference, DocumentSnapshot, getDoc, setDoc } from "firebase/firestore";
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

export function handleSignOut () {
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('uid');
    auth.signOut();
}

export function getCollectionByID (collection_name: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, collection_name);
}

export async function deleteDocDataByID (collection_name: string, doc_id: string) {
    try {
        const docRef = doc(db, collection_name, doc_id);
        await deleteDoc(docRef);
    } catch (error) {
        console.log(error);
    }
}

export async function getCurrentUserName () {
    let userData: DocumentData | null = null;

    if (localStorage.getItem('uid')) {
        userData = await getDocData('users', localStorage.getItem('uid') || '');
        if (!userData) return 'User';
        return userData.username;
    }

    if (!getCurrentUser()) return 'User';

    userData = await getDocData('users', getCurrentUser()!.uid);
    // const userData = await Promise.resolve({username: 'test'});

    if (!userData) return 'User';
    return userData.username;
}

export function getCurrentUser () {
    return auth.currentUser;
}

export async function getDocData (collection_name: string, id: string) {
    const docRef: DocumentReference<DocumentData, DocumentData> = doc(db, collection_name, id);
    const docSnap: DocumentSnapshot<DocumentData, DocumentData> = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function addDataToCollectionWithAutoID (collection_name: string, data: Record<string, unknown>) {
    const collectionRef: CollectionReference<DocumentData, DocumentData> = collection(db, collection_name);
    await addDoc(collectionRef, data);
}