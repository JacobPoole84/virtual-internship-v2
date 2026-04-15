// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd4XA4Io0Jrjv1dhNDZsdcDk8_VOHqjpo",
  authDomain: "summarist-9c872.firebaseapp.com",
  projectId: "summarist-9c872",
  storageBucket: "summarist-9c872.firebasestorage.app",
  messagingSenderId: "376664192495",
  appId: "1:376664192495:web:408f55624ccd247037b21a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);