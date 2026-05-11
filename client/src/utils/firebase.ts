
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "evelify.firebaseapp.com",
    projectId: "evelify",
    storageBucket: "evelify.firebasestorage.app",
    messagingSenderId: "876415982738",
    appId: "1:876415982738:web:e74480165d9291f3c11a4b"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };