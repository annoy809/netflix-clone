import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqvB8ZhoODevXdJb9zbvoOId_1DKy_dNw",
  authDomain: "netflix-clone-bb9bb.firebaseapp.com",
  projectId: "netflix-clone-bb9bb",
  storageBucket: "netflix-clone-bb9bb.appspot.com",
  messagingSenderId: "401716014413",
  appId: "1:401716014413:web:6d8f29eb6ca3d51ee69b04",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔔 Notifications listener (with error handling)
export const subscribeToNotifications = (callback) => {
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifs);
    },
    (error) => {
      console.error("Error fetching notifications:", error);
      callback([]); // fallback empty array
    }
  );
};

export { db };
