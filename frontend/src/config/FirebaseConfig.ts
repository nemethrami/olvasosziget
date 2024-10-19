// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGezuD9oUDKrH-pV4RJz_c0YMA8BL54Y8",
  authDomain: "olvasosziget-4c5e8.firebaseapp.com",
  projectId: "olvasosziget-4c5e8",
  storageBucket: "olvasosziget-4c5e8.appspot.com",
  messagingSenderId: "435214202339",
  appId: "1:435214202339:web:dd52e9825b41e737a49cd6",
  measurementId: "G-1RME50VPTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);