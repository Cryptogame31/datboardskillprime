import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4Et5Q_ZjNnO1eFQ7tiGvmEJGJw06Yhco",
  authDomain: "skill-prime.firebaseapp.com",
  projectId: "skill-prime",
  storageBucket: "skill-prime.firebasestorage.app",
  messagingSenderId: "141243228019",
  appId: "1:141243228019:web:94323b7859305733cc2f06",
  measurementId: "G-SCY58SRDD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
