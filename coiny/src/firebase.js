import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this line

const firebaseConfig = {
  apiKey: "AIzaSyD4IsUVeY6ORxQvD0u-a48rEpKH9dN_QY4",
  authDomain: "coiny-29232.firebaseapp.com",
  projectId: "coiny-29232",
  storageBucket: "coiny-29232.appspot.com",
  messagingSenderId: "1093102924726",
  appId: "1:1093102924726:web:d5e71d71cbbe199156c717",
  measurementId: "G-6HEM1TXZKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app); // Export Firestore instance

// Export Authentication Functions
export {  createUserWithEmailAndPassword, signInWithEmailAndPassword };
  