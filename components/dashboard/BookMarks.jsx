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
  const [usersPerPage] = useState(5);

  // Determină dacă utilizatorul este abonat
  const isSubscribed =
    userData?.subscriptionActive ||
    userData?.subscriptionStatus === "canceledUntilEnd";

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

        // Mapăm documentele din "Compatibilitati" cu toate câmpurile (inclusiv compatibilityScore)
        const compatibilityDocs = compatibilitatiSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Pentru fiecare document, obținem și datele utilizatorului compatibil din colecția "Users"
        const usersData = await Promise.all(
          compatibilityDocs.map(async (compDoc) => {
            const userId = compDoc.compatibleUserId;
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

        // Sortează utilizatorii descrescător după compatibilityScore
        const sortedUsersData = usersData.sort(
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
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Lista compatibilități</h1>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="py-30 px-30">
                <div className="row y-gap-30">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <CourseCardTwoDash
                        key={user.id}
                        data={user}
                        translatedTexts={translatedTexts}
                        compatibilityScore={user.compatibilityScore}
                        // Dacă nu este abonat, doar primul card va fi afișat normal
                        // iar restul vor fi marcate ca "blurate"
                        isFreeCard={!isSubscribed && index > 0}
                      />
                    ))
                  ) : (
                    <div className="col-12 text-center">
                      <p>
                        Momentan nu aveți compatibilități disponibile. Vă rugăm să reveniți mai târziu pentru a descoperi conexiunile perfecte!
                      </p>
                    </div>
                  )}
                </div>

                {currentUsers.length > 0 && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <FooterNine /> */}
    </div>
  );
}
