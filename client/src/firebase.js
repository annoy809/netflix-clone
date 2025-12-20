// ✅ Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqvB8ZhoODevXdJb9zbvoOId_1DKy_dNw",
  authDomain: "netflix-clone-bb9bb.firebaseapp.com",
  projectId: "netflix-clone-bb9bb",
  storageBucket: "netflix-clone-bb9bb.appspot.com",
  messagingSenderId: "401716014413",
  appId: "1:401716014413:web:6d8f29eb6ca3d51ee69b04",
  measurementId: "G-ZNB7TRR3CV"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Optional: disable App Verification in local dev
if (window.location.hostname === "localhost") {
  auth.settings.appVerificationDisabledForTesting = true;
}

// ✅ Notifications listener
const subscribeToNotifications = (callback) => {
  const q = query(collection(db, "notifications"));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifs);
  });
};

// ✅ Export everything you need
export { app, auth, db, subscribeToNotifications };
