"use client";

import AlertBox from "@/components/uiElements/AlertBox";
import { db } from "@/firebase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { Router, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { QuizResultsDocument } from "./QuizResultsDocument";
import { useAuth } from "@/context/AuthContext";
import { query } from "firebase/database";

export default function EditProfile({
  activeTab,
  translatedTexts,
  targetLanguage,
}) {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid"); // deja existent
  const cid = searchParams.get("cid"); // Noul parametru pentru compatibilitate
  
  const [compatibilityInfo, setCompatibilityInfo] = useState(null);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Loader pentru a afișa în timp ce datele sunt preluate
  const [isActivated, setIsActivated] = useState(false); // Stare pentru a gestiona isActivated
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    type: "",
    content: "",
    showAlert: false,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Stare pentru dialogul de confirmare
  const { userData: currentUserData } = useAuth(); // Datele utilizatorului curent
  const router = useRouter();

  // Funcție pentru eliminarea compatibilității
  const handleRemoveCompatibility = async () => {
    if (!currentUserData?.uid || !uid) return;

    try {
      setIsDeleting(true);

      // Șterge documentul din subcolecția utilizatorului curent
      const currentUserRef = collection(
        db,
        "Users",
        currentUserData.uid,
        "Compatibilitati"
      );
      const currentUserQuery = query(
        currentUserRef,
        where("compatibleUserId", "==", uid)
      );
      const currentUserSnapshot = await getDocs(currentUserQuery);

      currentUserSnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });

      // Șterge documentul din subcolecția utilizatorului compatibil
      const compatibleUserRef = collection(db, "Users", uid, "Compatibilitati");
      const compatibleUserQuery = query(
        compatibleUserRef,
        where("compatibleUserId", "==", currentUserData.uid)
      );
      const compatibleUserSnapshot = await getDocs(compatibleUserQuery);

      compatibleUserSnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref);
      });

      setAlertMessage({
        type: "success",
        content: translatedTexts.eliminaCompSuccess,
        showAlert: true,
      });

      // Redirecționează utilizatorul la lista compatibilităților
      router.push("/lista-compatibilitati");
    } catch (error) {
      console.error("Error removing compatibility:", error);
      setAlertMessage({
        type: "error",
        content: translatedTexts.eliminaCompError,
        showAlert: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Funcție pentru a prelua datele utilizatorului din Firebase pe baza UID-ului
  const fetchUserData = async (uid) => {
    if (!uid) return;

    try {
      const userDocRef = doc(db, "Users", uid); // Referință către documentul utilizatorului
      const userSnapshot = await getDoc(userDocRef); // Preluăm documentul

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        console.log("user data....informatiii", userData);
        setUserData(userData); // Setăm datele utilizatorului
        setIsActivated(userData?.isActivated || false); // Setăm isActivated
      } else {
        console.error("User not found!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false); // Oprim loader-ul
    }
  };

  // Preluăm datele când UID-ul este disponibil
  useEffect(() => {
    if (uid) {
      fetchUserData(uid);
    }
  }, [uid]);

  useEffect(() => {
    const fetchCompatibilityInfo = async () => {
      if (!cid || !currentUserData?.uid) return;
      try {
        const compDocRef = doc(
          db,
          "Users",
          currentUserData.uid,
          "Compatibilitati",
          cid
        );
        const compSnapshot = await getDoc(compDocRef);
        if (compSnapshot.exists()) {
          setCompatibilityInfo(compSnapshot.data());
        } else {
          console.log("No compatibility info found for cid:", cid);
        }
      } catch (error) {
        console.error("Error fetching compatibility info:", error);
      }
    };
  
    fetchCompatibilityInfo();
  }, [cid, currentUserData]);
  

  // Dacă încă se încarcă datele, afișăm un mesaj de încărcare
  if (loading) {
    return <p>Loading...</p>;
  }

  // Dacă nu există date despre utilizator, afișăm un mesaj de eroare
  if (!userData) {
    return <p>No user data found.</p>;
  }
  return (
    <div
      className={`tabs__pane -tab-item-1 ${activeTab == 1 ? "is-active" : ""} `}
    >
      <div className="row pb-50 mb-10">
        <div className="col-auto">
          <h1 className="text-30 lh-12 fw-700">{userData.username}</h1>
          {/* <div className="mt-10">
            Lorem ipsum dolor sit amet, consectetur.
          </div> */}
        </div>
      </div>
      <div className="row y-gap-20 x-gap-20 items-center">
        {/* Afișăm toate imaginile utilizatorului */}
        {userData?.images?.length > 0
          ? userData.images.map((image, index) => (
              <div
                key={image.fileUri || index} // Folosește fie fileUri (dacă există), fie index ca și cheie
                style={{ width: 300, height: 300, overflow: "hidden" }}
              >
                <Image
                  width={300}
                  height={300}
                  className="size-300"
                  src={image.fileUri}
                  alt={`User image ${index + 1}`}
                  style={{
                    objectFit: "cover", // Asigură că imaginea se întinde corect
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            ))
          : null}
      </div>

      <div className="border-top-light pt-30 mt-30">
        <form className="contact-form row y-gap-30">
          <div className="col-md-6">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.userNameText}
            </label>
            <input
              readOnly
              required
              type="text"
              placeholder="Nume Utilizator"
              value={userData?.username || ""}
            />
          </div>

          <div className="col-md-6">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.genText}
            </label>
            <input
              readOnly
              required
              type="text"
              placeholder="Nume Utilizator"
              value={userData?.gender || ""}
            />
          </div>

          <div className="col-md-6">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.ageText}
            </label>
            <input
              readOnly
              required
              type="text"
              placeholder={translatedTexts.ageText}
              value={userData?.age || ""}
            />
          </div>

          <div className="col-md-6">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.emailText}
            </label>
            <input
              readOnly
              required
              type="text"
              placeholder="Email"
              value={userData?.email || ""}
            />
          </div>
          {/* <div className="col-md-12">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.scopText}
            </label>
            <input
              readOnly
              required
              type="text"
              placeholder="Nume Utilizator"
              value={
                userData?.purpose === "love"
                  ? translatedTexts.amourText
                  : userData?.purpose === "casual"
                  ? translatedTexts.sexText
                  : userData?.purpose === "friendship"
                  ? translatedTexts.amitieText
                  : ""
              }
            />
          </div> */}

          <div className="col-12">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.aboutMeText}
            </label>
            <textarea
              readOnly
              required
              placeholder="Despre mine"
              rows="7"
              value={userData?.aboutMe || ""}
            ></textarea>
          </div>
          {/* <div className="col-12">
            <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.AddressText}
            </label>
            <textarea
              readOnly
              required
              placeholder="Despre mine"
              rows="7"
              value={userData?.address || ""}
            ></textarea>
          </div> */}

          {compatibilityInfo && (
  <div className="compatibility-info animated">
    <h2>Compatibilitate</h2>
    <div className="compatibility-percent">
      <strong>Scor:</strong> <span className="score">{compatibilityInfo.compatibilityScore}%</span>
    </div>
    <div className="compatibility-descriptions">
      <div className="description-block">
        <h3>Astrologie</h3>
        <p>
          <strong>Aspecte pozitive:</strong>{" "}
          {compatibilityInfo.compatibilityDescription.astrology.positive}
        </p>
        <p>
          <strong>Provocări:</strong>{" "}
          {compatibilityInfo.compatibilityDescription.astrology.challenge}
        </p>
      </div>
      <div className="description-block">
        <h3>Numerologie</h3>
        <p>
          <strong>Aspecte pozitive:</strong>{" "}
          {compatibilityInfo.compatibilityDescription.numerology.positive}
        </p>
        <p>
          <strong>Provocări:</strong>{" "}
          {compatibilityInfo.compatibilityDescription.numerology.challenge}
        </p>
      </div>
    </div>
  </div>
)}


          {/* <div className="col-12">
          <button
            className="button -md -purple-1 text-white"
            onClick={() => router.push("/chat")}
          >
            <i className="icon-document text-30 mr-10"></i>
            Download questions PDF
          </button>
        </div> */}

          <div className="col-12">
            <button
              className="button -md -purple-1 text-white"
              onClick={(e) => {
                e.preventDefault();
                router.push("/chat");
              }}
            >
              <i className="icon-message text-30 mr-10"></i>
              {translatedTexts.chatText}
            </button>
          </div>

          {/* <div className="col-lg-12 mt-20">
            <label className="text-30 lh-1 fw-500 text-dark-1 mb-10">
              {translatedTexts.quizText}
            </label>
          </div>
          {userData?.responses && (
            <div className="col-lg-6">
              <PDFDownloadLink
                document={
                  <QuizResultsDocument
                    userData={userData}
                    targetLanguage={targetLanguage}
                    noShowPersonalitateQuestions={true}
                  />
                }
                fileName={`Rezultate_Chestionar_${
                  userData?.username || "Utilizator"
                }.pdf`}
                className="button -md -purple-1 text-white"
              >
                {({ loading }) =>
                  loading
                    ? "Generare PDF..."
                    : `${translatedTexts.downloadQuizText}`
                }
              </PDFDownloadLink>
            </div>
          )} */}

          <div className="col-12">
            <button
              type="button"
              className="button -md -red-1 text-white"
              onClick={handleRemoveCompatibility}
              disabled={isDeleting}
            >
              {isDeleting
                ? translatedTexts.eliminaCompLoading
                : translatedTexts.eliminaComp}
            </button>
          </div>
        </form>
      </div>

      <AlertBox
        type={alertMessage.type}
        message={alertMessage.content}
        showAlert={alertMessage.showAlert}
        onClose={() => setAlertMessage({ ...alertMessage, showAlert: false })}
      />

<style jsx>{`
  .compatibility-info {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 30px;
    animation: fadeInUp 0.6s ease-out;
  }
  .compatibility-info h2 {
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
  .compatibility-percent {
    font-size: 18px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }
  .compatibility-percent .score {
    margin-left: 10px;
    font-size: 22px;
    font-weight: 700;
    color: #e74c3c;
    animation: popIn 0.5s ease-out;
  }
  .compatibility-descriptions {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .description-block {
    flex: 1;
    min-width: 250px;
    background: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .description-block h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
  }
  .description-block p {
    font-size: 16px;
    margin-bottom: 8px;
    color: #555;
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes popIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`}</style>

    </div>
  );
}
