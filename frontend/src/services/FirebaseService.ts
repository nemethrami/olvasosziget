import { addDoc, arrayRemove, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentData, DocumentReference, DocumentSnapshot, getDoc, getDocs, Query, QuerySnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db, storage } from "@config/FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref } from "firebase/storage";
import { CommentModel } from "@models/ReviewModel";

export async function googleSignIn() {
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    
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

export async function handleSignOut () {
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('uid');
    await auth.signOut();
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

export async function isUserAdmin () {
    const currentUserId: string | null = localStorage.getItem('uid');

    if (!currentUserId) return;
    
    const userData: DocumentData = await getDocData('users', currentUserId);
    return userData.is_admin;
}

export async function addDataToCollectionWithAutoID (collection_name: string, data: Record<string, unknown>) {
    const collectionRef: CollectionReference<DocumentData, DocumentData> = collection(db, collection_name);
    await addDoc(collectionRef, data);
}

export function getStorageRef (url: string) {
    return ref(storage, url);
}

export function getDocRef (collectionName: string, docID: string) {
    return doc(db, collectionName, docID);
}

export async function getCollectionDataByID (collection_name: string) {
    return await getDocs(collection(db, collection_name));
}

export async function userFollow(uid: string) {
    const currentUserId: string | null = localStorage.getItem('uid');

    if (!currentUserId) return;

    await updateDoc(getDocRef('users', uid), {
        followers: arrayUnion(currentUserId),
    });

    await updateDoc(getDocRef('users', currentUserId), {
        following: arrayUnion(uid),
    });
}

export async function userUnFollow(uid: string) {
    const currentUserId: string | null = localStorage.getItem('uid');

    if (!currentUserId) return;

    await updateDoc(getDocRef('users', uid), {
      followers: arrayRemove(currentUserId),
    });

    await updateDoc(getDocRef('users', currentUserId), {
      following: arrayRemove(uid),
    });
}

export async function getAvatarUrlByUserName(userName: string) {
    const collectionData: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
    const userData = collectionData.docs.filter((doc) => doc.data().username === userName);
    return userData[0].data().avatar_url;
}

export async function getDocsByQuery(query: Query<DocumentData, DocumentData>) {
    const docSnap: QuerySnapshot<DocumentData, DocumentData> = await getDocs(query);
    return !docSnap.empty ? docSnap.docs : null;
}

export async function postLike(postId: string, value: string) {
    await updateDoc(getDocRef('reviews', postId), {
        likes: arrayUnion(value),
    });
}

export async function postDislike(postId: string, value: string) {
    await updateDoc(getDocRef('reviews', postId), {
        likes: arrayRemove(value),
    });
}

export async function postComment(postId: string, value: CommentModel) {
    await updateDoc(getDocRef('reviews', postId), {
        comments: arrayUnion(value),
    });
}

export async function postCommentDelete(postId: string, value: CommentModel) {
    await updateDoc(getDocRef('reviews', postId), {
        comments: arrayRemove(value),
    });
}

export async function updateGoalAttributes(goalId: string, attributes: Record<string, unknown>) {
    await updateDoc(getDocRef('goals', goalId), attributes);
}

export async function updateDocAttributes(collectionName: string, docId: string, attributes: Record<string, unknown>) {
    await updateDoc(getDocRef(collectionName, docId), attributes);
}

export async function getUidByUserName(userName: string) {
    const collectionData: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
    const userData = collectionData.docs.filter((doc) => doc.data().username === userName);
    return userData[0].id;
}

export async function getAllUserName() {
    const users: QuerySnapshot<DocumentData, DocumentData> = await getCollectionDataByID('users');
    const userNames: string[] = users.docs.map((doc) => doc.data().username);
    return userNames || [];
}
