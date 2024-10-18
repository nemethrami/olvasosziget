import { auth, googleProvider } from "../config/FirebaseConfig";
import { signInWithPopup } from "firebase/auth";

export default async function googleSignIn() {
    return await signInWithPopup(auth, googleProvider);
}