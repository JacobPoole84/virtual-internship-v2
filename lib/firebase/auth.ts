import { auth } from "./init";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginGuest() {
  return signInWithEmailAndPassword(auth, "email@email.com", "test123");
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return signInWithPopup(auth, provider);
}

export function logOut() {
  signOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
