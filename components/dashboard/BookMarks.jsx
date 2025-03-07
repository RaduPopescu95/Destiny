"use client"

import React, { useEffect, useState } from "react";
import CourseCardTwoDash from "./DashBoardCards/CourseCardTwoDash";
import FooterNine from "../layout/footers/FooterNine";
import Pagination from "../common/Pagination";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function BookMarks({ translatedTexts }) {
  const { userData } = useAuth();
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);


  // Determină dacă utilizatorul este abonat
  let isSubscribed =
    userData?.subscriptionActive ||
    userData?.subscriptionStatus === "canceledUntilEnd";

  isSubscribed = true

  useEffect(() => {
    const fetchCompatibleUsers = async () => {
      if (!userData?.uid) return;
      try {
        const compatibilitatiRef = collection(
          db,
          "Users",
          userData.uid,
          "Compatibilitati"
        );
        const compatibilitatiSnapshot = await getDocs(compatibilitatiRef);

        // Mapăm documentele din "Compatibilitati" cu toate câmpurile
        const compatibilityDocs = compatibilitatiSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Pentru fiecare document, obținem datele utilizatorului compatibil,
        // dar excludem cazul în care compatibleUserId === userData.uid (contul propriu)
        const usersData = await Promise.all(
          compatibilityDocs.map(async (compDoc) => {
            const userId = compDoc.compatibleUserId;
            if (userId === userData.uid) return null; // Exclud contul propriu
            const userDocRef = doc(db, "Users", userId);
            const userSnapshot = await getDoc(userDocRef);
            return {
              compatibilityId: compDoc.id,
              id: userSnapshot.id,
              ...userSnapshot.data(),
              compatibilityScore: compDoc.compatibilityScore,
              compatibilityDescription: compDoc.compatibilityDescription,
            };
          })
        );

        // Eliminăm eventualele null rezultate din compatibilitățile proprii
        const validUsersData = usersData.filter((user) => user !== null);

        // Sortează utilizatorii descrescător după compatibilityScore
        const sortedUsersData = validUsersData.sort(
          (a, b) => b.compatibilityScore - a.compatibilityScore
        );

        setCompatibleUsers(sortedUsersData);
        setFilteredUsers(sortedUsersData);
      } catch (error) {
        console.error("Error fetching compatible users:", error);
      }
    };

    fetchCompatibleUsers();
  }, [userData?.uid]);

  // Paginare
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const currentUsers = filteredUsers;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">{translatedTexts.bookmarksText1}</h1>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="py-30 px-30">
                <div className="row y-gap-30">
                {currentUsers.length > 0 ? (
  currentUsers.map((user, index) => {
    const globalIndex = indexOfFirstUser + index;
    return (
      <CourseCardTwoDash
        key={`${user.compatibilityId}-${user.id}`}
        data={user}
        translatedTexts={translatedTexts}
        compatibilityScore={user.compatibilityScore}
        // Pentru utilizatorii neabonați, primele 5 compatibilități (globalIndex < 5) vor fi afișate normal,
        // iar restul vor fi blurrate
        isFreeCard={!isSubscribed && globalIndex >= 5}
      />
    );
  })
) : (
  <div className="col-12 text-center">
    <p>{translatedTexts.bookmarksText2}</p>
  </div>
)}

                </div>

                {/* {currentUsers.length > 0 && (
                  <div className="row justify-center pt-30">
                    <div className="col-auto">
                      <Pagination
                        usersPerPage={usersPerPage}
                        totalUsers={filteredUsers.length}
                        paginate={paginate}
                        currentPage={currentPage}
                      />
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <FooterNine /> */}
    </div>
  );
}
