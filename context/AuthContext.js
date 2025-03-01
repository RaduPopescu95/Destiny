"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authentication, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);

        try {
          // Căutăm documentul din colecția "Users" unde "uid" == user.uid
          const q = query(collection(db, "Users"), where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // În mod normal, te aștepți la un singur document (un singur user cu acest UID)
            querySnapshot.forEach(async (docSnap) => {
              const userDocData = docSnap.data();
              setUserData(userDocData);

              // Setăm lastTimeActive = new Date() pentru a-l actualiza
              // Observație: docSnap.id este ID-ul documentului din colecția Users
              const userDocRef = doc(db, "Users", docSnap.id);
              await setDoc(
                userDocRef,
                { 
                  lastTimeActive: new Date() 
                },
                { merge: true }
              );
            });
          } else {
            console.log("Niciun document găsit pentru acest UID în colecția Users.");
          }
        } catch (error) {
          console.error(
            "Eroare la preluarea/actualizarea datelor utilizatorului din Firestore:",
            error
          );
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    currentUser,
    userData,
    loading,
    setUserData,
    setCurrentUser,
    setLoading,
    language,
    changeLanguage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
