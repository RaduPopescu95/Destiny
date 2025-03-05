"use client";

import React, { useEffect, useState, useRef } from "react";
import EditProfile from "./EditProfile";
import Password from "./Password";
import SocialProfiles from "./SocialProfiles";
import CloseAccount from "./CloseAccount";
import FooterNine from "@/components/layout/footers/FooterNine";
import Notification from "./Notifications";
import Pagination from "@/components/common/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { db } from "@/firebase";
import ListCompatibilitati from "../DashBoardCards/ListaCompatibilitatiComp";
import compatibilityData from "@/data/compatibilityData";


const zodiacElements = {
  "Berbec": "Foc",
  "Taur": "Pământ",
  "Gemeni": "Aer",
  "Rac": "Apă",
  "Leu": "Foc",
  "Fecioară": "Pământ",
  "Balanță": "Aer",
  "Scorpion": "Apă",
  "Săgetător": "Foc",
  "Capricorn": "Pământ",
  "Vărsător": "Aer",
  "Pești": "Apă"
};

const elementCompatibility = {
  "Foc": ["Foc", "Aer"],
  "Pământ": ["Pământ", "Apă"],
  "Aer": ["Aer", "Foc"],
  "Apă": ["Apă", "Pământ"]
};

// Matrice de compatibilitate numerologică conform noilor reguli
const numerologyCompatibility = {
  1: { 1: 90, 2: 70, 3: 80, 4: 60, 5: 75, 6: 65, 7: 55, 8: 85, 9: 50 },
  2: { 1: 70, 2: 90, 3: 80, 4: 70, 5: 65, 6: 85, 7: 60, 8: 75, 9: 70 },
  3: { 1: 75, 2: 80, 3: 90, 4: 70, 5: 85, 6: 75, 7: 60, 8: 70, 9: 60 },
  4: { 1: 70, 2: 80, 3: 65, 4: 90, 5: 60, 6: 80, 7: 65, 8: 80, 9: 70 },
  5: { 1: 75, 2: 70, 3: 85, 4: 60, 5: 90, 6: 65, 7: 60, 8: 65, 9: 70 },
  6: { 1: 70, 2: 85, 3: 75, 4: 80, 5: 65, 6: 90, 7: 60, 8: 70, 9: 65 },
  7: { 1: 65, 2: 75, 3: 70, 4: 85, 5: 60, 6: 70, 7: 90, 8: 60, 9: 70 },
  8: { 1: 75, 2: 70, 3: 65, 4: 80, 5: 60, 6: 80, 7: 65, 8: 90, 9: 60 },
  9: { 1: 65, 2: 80, 3: 75, 4: 70, 5: 60, 6: 80, 7: 75, 8: 60, 9: 90 },
};

function calculateDestinyNumber(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    console.error("calculateDestinyNumber: dateStr is not defined or not a string", dateStr);
    return 0;
  }
  // Eliminăm separatoarele, păstrând doar cifrele
  const digits = dateStr.replace(/\D/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// Funcție pentru descrierea compatibilității (astrologie și numerologie)
const getCompatibilityDescription = (currentElement, userElement, currentDestiny, userDestiny) => {
  // Descriere astrologică
  let astroKey = `${currentElement}-${userElement}`;
  if (!compatibilityData.astrology[astroKey]) {
    astroKey = `${userElement}-${currentElement}`;
  }
  const astroDesc = compatibilityData.astrology[astroKey] || {
    positive: "Compatibilitate astrologică generală.",
    challenge: "Provocări posibile în comunicare."
  };

  // Descriere numerologică bazată pe numerele destin
  let numKey = `${currentDestiny}-${userDestiny}`;
  if (!compatibilityData.numerology[numKey]) {
    numKey = `${userDestiny}-${currentDestiny}`;
  }
  const numDesc = compatibilityData.numerology[numKey] || {
    positive: "Compatibilitate numerologică generală.",
    challenge: "Provocări posibile în comunicare."
  };

  return {
    astrology: astroDesc,
    numerology: numDesc,
  };
};

export default function Settings({ translatedTexts }) {
  const [users, setUsers] = useState([]);
  const [currentUserResponses, setCurrentUserResponses] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(1000);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  // Ref pentru contorizarea auto-marcărilor
  const autoMarkCountRef = useRef(0);
  const AUTO_MARK_LIMIT = 3;
  const registerAutoMark = () => {
    if (autoMarkCountRef.current < AUTO_MARK_LIMIT) {
      autoMarkCountRef.current++;
      return true;
    }
    return false;
  };

  useEffect(() => {
    autoMarkCountRef.current = 0;
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Obține datele utilizatorului curent
        const currentUserDoc = await getDoc(doc(db, "Users", uid));
        if (currentUserDoc.exists()) {
          setCurrentUserResponses(currentUserDoc.data().responses || {});
        }
        // Obține lista celorlalți utilizatori (excluzând utilizatorul curent și cei fără răspunsuri)
        const usersCollection = collection(db, "Users");
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.id !== uid && user.responses);
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error("Error fetching users or current user:", error);
      }
    };
    fetchUsers();
  }, [uid]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Funcție de calculare a compatibilității conform noilor reguli
  // Presupunem că răspunsurile pentru întrebările din "firstQuestions" sunt:
  //  [0]: "Care este zodia ta?" (astrologie)
  //  [1]: "Care este data ta de naștere? (Format: ZZ/LL/AAAA)" (numerologie)
  //  [2]: "Ce tip de relație cauți?" (filtrare după tipul de relație)
  const calculateCompatibility = (userResponses) => {
    const currentResponses = currentUserResponses || {};

    const currentZodiac = currentResponses.firstQuestions?.[0]?.answer;
    const currentBirthDate = currentResponses.firstQuestions?.[1]?.answer;
    const currentRelationType = currentResponses.firstQuestions?.[2]?.answer;

    const userZodiac = userResponses.firstQuestions?.[0]?.answer;
    const userBirthDate = userResponses.firstQuestions?.[1]?.answer;
    const userRelationType = userResponses.firstQuestions?.[2]?.answer;

    if (!currentZodiac || !currentBirthDate || !userZodiac || !userBirthDate) {
      return null; // Date insuficiente
    }

    if (currentRelationType !== userRelationType) {
      console.log("Incompatible relation types:", currentRelationType, userRelationType);
      return null;
    }

    // Calcul compatibilitate astrologică
    const currentElement = zodiacElements[currentZodiac];
    const userElement = zodiacElements[userZodiac];
    let astrologyScore = 0;
    if (currentElement && userElement) {
      astrologyScore = elementCompatibility[currentElement].includes(userElement) ? 100 : 0;
    }

    // Calcul compatibilitate numerologică folosind matricea definită
    const currentDestiny = calculateDestinyNumber(currentBirthDate);
    const userDestiny = calculateDestinyNumber(userBirthDate);
    let numerologyScore = 0;
    if (numerologyCompatibility[currentDestiny] && numerologyCompatibility[currentDestiny][userDestiny]) {
      numerologyScore = numerologyCompatibility[currentDestiny][userDestiny];
    }

    // Scorul final este media celor două scoruri
    const overallScore = Math.round((astrologyScore + numerologyScore) / 2);

    // Obținem descrierea compatibilității (pentru a afișa detalii suplimentare)
    const compatibilityDescription = getCompatibilityDescription(
      currentElement,
      userElement,
      currentDestiny,
      userDestiny
    );

    return {
      compatibilityScore: overallScore,
      details: {
        astrology: {
          currentZodiac,
          userZodiac,
          currentElement,
          userElement,
          astrologyScore,
        },
        numerology: {
          currentBirthDate,
          userBirthDate,
          currentDestiny,
          userDestiny,
          numerologyScore,
        },
        relation: {
          currentRelationType,
          userRelationType,
        },
        compatibilityDescription,
      },
    };
  };

  const compatibleUsers = users
    .filter((user) => user.responses)
    .map((user) => ({
      ...user,
      compatibility: calculateCompatibility(user.responses),
    }))
    .filter((user) => user.compatibility !== null)
    .sort(
      (a, b) =>
        b.compatibility.compatibilityScore - a.compatibility.compatibilityScore
    );

  const totalCompatibleUsers = compatibleUsers.length;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentCompatibleUsers = compatibleUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      autoMarkCountRef.current = 0;
    }
  }, []);

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="tabs -active-purple-2 js-tabs pt-0">
                {/* Content Tabs */}
                <div className="tabs__content py-30 px-30 js-tabs-content">
                  {activeTab === 1 && (
                    <EditProfile activeTab={activeTab} translatedTexts={translatedTexts} />
                  )}
                  {activeTab === 2 && <Password />}
                  {activeTab === 3 && <SocialProfiles />}
                  {activeTab === 4 && <Notification />}
                  {activeTab === 5 && <CloseAccount />}
                </div>

                {/* Lista Compatibilități */}
                <div className="tabs__content py-30 px-30 js-tabs-content mt-5">
                  <div className="tabs__pane -tab-item-1 is-active">
                    <div className="row y-gap-30 pt-30">
                      <div className="col-12">
                        <h2 className="text-black">
                          <i className="icon-person-2 text-40 mr-10"></i>
                          {translatedTexts.listCompText}
                        </h2>
                      </div>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Nom d'utilisateur</th>
                            <th>{translatedTexts.genText}</th>
                            <th>Varsta</th>
                            <th>Compatibilitate</th>
                            <th>Grad comp</th>
                            <th>Acțiuni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compatibleUsers.map((user, index) => (
                            <ListCompatibilitati
                              data={user}
                              key={user.id}
                              compatibility={user?.compatibility?.compatibilityScore}
                              translatedTexts={translatedTexts}
                              userUid={uid}
                              index={index}
                              registerAutoMark={registerAutoMark}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="row justify-center pt-30">
                      <div className="col-auto">
                        <Pagination
                          usersPerPage={usersPerPage}
                          totalUsers={totalCompatibleUsers}
                          paginate={paginate}
                          currentPage={currentPage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterNine />
    </div>
  );
}
