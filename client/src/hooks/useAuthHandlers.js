import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function useAuthHandlers() {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // ✅ Create user doc if it doesn't exist
            const defaultProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || "User",
              email: currentUser.email,
              profilePic: currentUser.photoURL || "",
              createdAt: new Date().toISOString()
            };

            await setDoc(docRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Failed to get or create user profile", err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return userProfile;
}
