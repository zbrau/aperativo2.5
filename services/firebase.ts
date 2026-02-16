import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTS6IXhO1_VhwlhDxcVQGZu-jB6PmsD78",
  authDomain: "escuelaeats.firebaseapp.com",
  projectId: "escuelaeats",
  storageBucket: "escuelaeats.firebasestorage.app",
  messagingSenderId: "22013540088",
  appId: "1:22013540088:web:1f0e6d6b6e2dbf1bd22d0d",
  measurementId: "G-CRJZMWD6YS"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = app.firestore();
