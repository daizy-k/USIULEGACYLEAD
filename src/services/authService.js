import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/config";

function validateEmail(email) {
  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith("@usiu.ac.ke")) {
    throw new Error("Please use your USIU email address.");
  }

  return normalized;
}

// Login
export async function login(email, password) {
  email = validateEmail(email);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Signup
export async function signup(email, password) {
  email = validateEmail(email);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}