import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDqOHWhOADO0dbB64qpyoJMFAj_hu8Ex-Y",
  authDomain: "pedido-de-saque.firebaseapp.com",
  databaseURL: "https://pedido-de-saque-default-rtdb.firebaseio.com",
  projectId: "pedido-de-saque",
  storageBucket: "pedido-de-saque.firebasestorage.app",
  messagingSenderId: "423175454841",
  appId: "1:423175454841:web:e0a1ec141fea68527154a8",
  measurementId: "G-5755H7P0Y6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
