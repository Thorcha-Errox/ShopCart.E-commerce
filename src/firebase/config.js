import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyDcaY5Hwsqz2yYpk0sOmoTG7v38W0KzA_A",
  authDomain: "shopcart-test-ca561.firebaseapp.com",
  projectId: "shopcart-test-ca561",
  // storageBucket: "shopcart-test-ca561.firebasestorage.app",
  messagingSenderId: "1071737318525",
  appId: "1:1071737318525:web:b51cc77673d9038cae1514",
  measurementId: "G-2VV0NNTH1E"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);

export default app;
