import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAkE3fyAis8id7Y-ZZPlzGVWe7JgHauDHU",
  authDomain: "money-storm-br.firebaseapp.com",
  databaseURL: "https://money-storm-br-default-rtdb.firebaseio.com",
  projectId: "money-storm-br",
  storageBucket: "money-storm-br.appspot.com",
  messagingSenderId: "708466194784",
  appId: "1:708466194784:web:a55298f2846e7427b70605",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
