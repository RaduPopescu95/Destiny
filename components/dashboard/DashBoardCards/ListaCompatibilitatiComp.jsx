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
    try {
      const compatRefUser1 = collection(db, "Users", userUid, "Compatibilitati");
      const compatRefUser2 = collection(db, "Users", data.id, "Compatibilitati");

      if (isCompatible) {
        return;
      } else {
        const compatibilityDescription =
          data.compatibility.details.compatibilityDescription;
        const compatibilityScore = data.compatibility.compatibilityScore;

        const newData = {
          compatibleUserId: data.id,
          markedAt: new Date(),
          compatibilityDescription,
          compatibilityScore,
        };

        if (autoMark) newData.auto = true;

        const docRefUser1 = await addDoc(compatRefUser1, newData);
        await updateDoc(docRefUser1, { documentId: docRefUser1.id });

        const docRefUser2 = await addDoc(compatRefUser2, newData);
        await updateDoc(docRefUser2, { documentId: docRefUser2.id });

        setIsCompatible(true);
      }
    } catch (error) {
      console.error("Error toggling compatibility:", error);
    }
  };

  useEffect(() => {
    const autoMark = async () => {
      if (autoMarkDone.current) return;
      if (
        !isCompatible &&
        data.compatibility &&
        data.compatibility.compatibilityScore >= 90 &&
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
