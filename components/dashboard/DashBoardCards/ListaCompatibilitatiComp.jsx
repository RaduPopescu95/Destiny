import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { firstQuestions as questions } from "@/data/quiz";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { QuizResultsDocumentListComp } from "./QuizResultsDocumentListaComp";

export default function ListCompatibilitati({
  data,
  translatedTexts,
  compatibility,
  userUid,
  index, // indexul transmis din componenta părinte
  registerAutoMark, // funcția transmisă din componenta părinte
}) {
  const router = useRouter();
  const [isCompatible, setIsCompatible] = useState(false);
  const [currentUserRelation, setCurrentUserRelation] = useState(null);
  const [currentUserGender, setCurrentUserGender] = useState(null);
  // Ref pentru a ne asigura că auto-markarea se face o singură dată pentru acest rând
  const autoMarkDone = useRef(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const docSnap = await getDoc(doc(db, "Users", userUid));
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCurrentUserRelation(
            userData.responses?.firstQuestions?.[2]?.answer || null
          );
          setCurrentUserGender(userData.gender || null);
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    };
    fetchCurrentUser();
  }, [userUid]);

  useEffect(() => {
    const checkCompatibility = async () => {
      try {
        const compatRef = collection(db, "Users", userUid, "Compatibilitati");
        const q = query(compatRef, where("compatibleUserId", "==", data.id));
        const snapshot = await getDocs(q);
        setIsCompatible(!snapshot.empty);
      } catch (error) {
        console.error("Error checking compatibility:", error);
      }
    };
    checkCompatibility();
  }, [data.id, userUid]);



  const handleCardClick = () => {
    router.push(`/informatii-utilizator?uid=${data.id}`);
  };

  const handleToggleCompatibility = async (autoMark = false) => {
    // Nu permite compatibilitatea cu propriul cont
    if (data.id === userUid) {
      console.warn("Nu este permisă marcarea compatibilității cu propriul cont.");
      return;
    }
    try {
      const compatRefUser1 = collection(db, "Users", userUid, "Compatibilitati");
      const compatRefUser2 = collection(db, "Users", data.id, "Compatibilitati");
  
      if (isCompatible) {
        // Dacă compatibilitatea există, caută documentele și șterge-le
        
        // Ștergem din colecția utilizatorului curent
        const q1 = query(compatRefUser1, where("compatibleUserId", "==", data.id));
        const snapshot1 = await getDocs(q1);
        snapshot1.forEach(async (docSnap) => {
          await deleteDoc(doc(db, "Users", userUid, "Compatibilitati", docSnap.id));
        });
        
        // Ștergem și din colecția celuilalt utilizator
        // Atenție: Dacă la adăugare folosești același câmp "compatibleUserId",
        // asigură-te că interogarea se face corect; în unele cazuri poate fi necesar să folosești userUid.
        const q2 = query(compatRefUser2, where("compatibleUserId", "==", userUid));
        const snapshot2 = await getDocs(q2);
        snapshot2.forEach(async (docSnap) => {
          await deleteDoc(doc(db, "Users", data.id, "Compatibilitati", docSnap.id));
        });
        
        setIsCompatible(false);
        return;
      } else {
        const compatibilityDescription =
          data.compatibility.details.compatibilityDescription;
        const compatibilityScore = data.compatibility.compatibilityScore;
  
        const newDataForUser1 = {
          compatibleUserId: data.id,
          markedAt: new Date(),
          compatibilityDescription,
          compatibilityScore,
          ...(autoMark && { auto: true })
        };
        
        const newDataForUser2 = {
          compatibleUserId: userUid, // aici setăm partenerul ca fiind contul curent
          markedAt: new Date(),
          compatibilityDescription,
          compatibilityScore,
          ...(autoMark && { auto: true })
        };
        
        const docRefUser1 = await addDoc(compatRefUser1, newDataForUser1);
        await updateDoc(docRefUser1, { documentId: docRefUser1.id });
        
        const docRefUser2 = await addDoc(compatRefUser2, newDataForUser2);
        await updateDoc(docRefUser2, { documentId: docRefUser2.id });
        
        setIsCompatible(true);
      }
    } catch (error) {
      console.error("Error toggling compatibility:", error);
    }
  };
  

  useEffect(() => {
    const autoMark = async () => {
      // Verificare: dacă se compară cu propriul cont, nu face nimic
      if (data.id === userUid) return;
      
      if (autoMarkDone.current) return;
      if (
        !isCompatible &&
        data.compatibility &&
        data.compatibility.compatibilityScore >= 80 &&
        currentUserRelation
      ) {
        let eligible = false;
        if (currentUserRelation === "Prietenie") {
          eligible = true;
        } else if (
          (currentUserRelation === "Relație de lungă durată" ||
            currentUserRelation === "Relație casual") &&
          currentUserGender &&
          data.gender &&
          currentUserGender !== data.gender
        ) {
          eligible = true;
        }
        if (!eligible) return;
  
        // Folosim funcția registerAutoMark primită din părinte
        if (registerAutoMark && registerAutoMark()) {
          await handleToggleCompatibility(true);
          autoMarkDone.current = true;
        }
      }
    };
    autoMark();
  }, [currentUserRelation, currentUserGender, data, isCompatible, index, registerAutoMark]);
  
  const styles = StyleSheet.create({
    page: { padding: 30 },
    title: { fontSize: 18, marginBottom: 10, textAlign: "center", color: "#003366" },
    question: { fontSize: 12, marginBottom: 5, color: "#333333" },
    answer: { fontSize: 10, marginBottom: 15, color: "#666666" },
  });

  const PDFDocument = (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>
          {translatedTexts.rezultateleChestionaruluiText} {data?.username}
        </Text>
        {questions &&
          questions.map((question, idx) => (
            <View key={question.id}>
              <Text style={styles.question}>
                {idx + 1}. {question.text || "Întrebare indisponibilă"}
              </Text>
              <Text style={styles.answer}>
                {translatedTexts.raspunsulUtilizatoruluiText}:{" "}
                {data?.responses?.[question.id] || "N/A"}
              </Text>
            </View>
          ))}
      </Page>
    </Document>
  );

  return (
    <tr>
      <td>{data.username}</td>
      <td>{data.gender ? data.gender : "N/A"}</td>
      <td>{data.age ? data.age : "N/A"}</td>
      <td>{data.isActivated ? "Cont activ" : "Cont inactiv"}</td>
      <td>{compatibility}%</td>
      <td style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="btn custom-btn-compatibilitati"
        >
          {translatedTexts.veziDetaliiText}
        </button>
        <PDFDownloadLink
          document={<QuizResultsDocumentListComp userData={data} />}
          fileName={`Results_${data.username}.pdf`}
        >
          {({ loading }) => (
            <button onClick={(e) => e.stopPropagation()} className="btn custom-btn-compatibilitati">
              {loading ? "Génération du PDF..." : "Télécharger le PDF"}
            </button>
          )}
        </PDFDownloadLink>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCompatibility();
          }}
          className="btn custom-btn-compatibilitati"
        >
          {isCompatible ? "Supprimer la compatibilité" : "Marquer la compatibilité"}
        </button>
      </td>
    </tr>
  );
}
