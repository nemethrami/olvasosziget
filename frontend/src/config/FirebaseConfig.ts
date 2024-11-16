// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/* const firebaseConfig = {
  apiKey: "AIzaSyBGezuD9oUDKrH-pV4RJz_c0YMA8BL54Y8",
  authDomain: "olvasosziget-4c5e8.firebaseapp.com",
  projectId: "olvasosziget-4c5e8",
  storageBucket: "olvasosziget-4c5e8.appspot.com",
  messagingSenderId: "435214202339",
  appId: "1:435214202339:web:dd52e9825b41e737a49cd6",
  measurementId: "G-1RME50VPTD"
}; */

const firebaseConfig = {
  apiKey: "AIzaSyAu-jQ1FL9lC55jxqG5DBbzTX6b4PB9QvI",
  authDomain: "olvasosziget-zfz2s1.firebaseapp.com",
  projectId: "olvasosziget-zfz2s1",
  storageBucket: "olvasosziget-zfz2s1.appspot.com",
  messagingSenderId: "46903106678",
  appId: "1:46903106678:web:34acffa267d42785f8d357",
  measurementId: "G-6DP67B7RPJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);