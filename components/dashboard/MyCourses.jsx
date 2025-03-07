"use client"

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import CoursesCardDashboard from "./DashBoardCards/CoursesCardDashboard";
import Pagination from "../common/Pagination";
import { useRouter } from "next/navigation";

export default function MyCourses({ translatedTexts }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  // Stări pentru filtrare și sortare
  const [filterSubscription, setFilterSubscription] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNoCompat, setFilterNoCompat] = useState(false);
  const [filterOldCompat, setFilterOldCompat] = useState(false); // noul filtru pentru compatibilitate veche
  const [filterHasImages, setFilterHasImages] = useState(false); // noul filtru pentru a afișa doar utilizatorii cu imagini
  const oldThresholdDays = 3; // prag de 3 zile

  const [sortOrder, setSortOrder] = useState(null); // pentru compatCount
  const [sortAgeOrder, setSortAgeOrder] = useState(null); // pentru age
  const [sortChatOrder, setSortChatOrder] = useState(null); // pentru chatCount
  const [sortLastActiveOrder, setSortLastActiveOrder] = useState(null); // pentru lastTimeActive
  const [sortLastCompatOrder, setSortLastCompatOrder] = useState(null); // pentru ultima compatibilitate
  const [genderFilter, setGenderFilter] = useState("all"); // "all", "male", "female"

  const router = useRouter();

  // Citim valoarea stocată a paginii curente la montarea componentei
  useEffect(() => {
    const storedPage = localStorage.getItem("myCoursesCurrentPage");
    if (storedPage) {
      setCurrentPage(Number(storedPage));
    }
  }, []);

  // Funcții pentru toggle sortare (codul existent)
  const handleSortByChatCount = () => {
    const newOrder = sortChatOrder === "asc" ? "desc" : "asc";
    setSortChatOrder(newOrder);
    setSortOrder(null);
    setSortAgeOrder(null);
    setSortLastActiveOrder(null);
    setSortLastCompatOrder(null);
  };

  const handleSortByLastActive = () => {
    const newOrder = sortLastActiveOrder === "asc" ? "desc" : "asc";
    setSortLastActiveOrder(newOrder);
    setSortOrder(null);
    setSortAgeOrder(null);
    setSortChatOrder(null);
    setSortLastCompatOrder(null);
  };

  const handleSortByCompatCount = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setSortAgeOrder(null);
    setSortChatOrder(null);
    setSortLastActiveOrder(null);
    setSortLastCompatOrder(null);
  };

  const handleSortByAge = () => {
    const newSortAgeOrder = sortAgeOrder === "asc" ? "desc" : "asc";
    setSortAgeOrder(newSortAgeOrder);
    setSortOrder(null);
    setSortChatOrder(null);
    setSortLastActiveOrder(null);
    setSortLastCompatOrder(null);
  };

  const handleSortByLastCompat = () => {
    const newOrder = sortLastCompatOrder === "asc" ? "desc" : "asc";
    setSortLastCompatOrder(newOrder);
    setSortOrder(null);
    setSortAgeOrder(null);
    setSortChatOrder(null);
    setSortLastActiveOrder(null);
  };

  // 1. Fetch utilizatori și calcularea atributelor (compatCount, chatCount, lastCompatibility, etc.)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Users");
        const userSnapshot = await getDocs(usersCollection);

        // Documentele din colecția Chats
        const chatsCollection = collection(db, "Chats");
        const chatsSnapshot = await getDocs(chatsCollection);
        const chatDocs = chatsSnapshot.docs;

        const usersList = await Promise.all(
          userSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            // Dacă utilizatorul nu are răspunsuri, returnează null
            if (!data.responses) return null;

            let userData = { id: docSnap.id, ...data };

            // Compatibilități
            const compatCollection = collection(db, "Users", docSnap.id, "Compatibilitati");
            const compatSnapshot = await getDocs(compatCollection);
            userData.hasCompatibilitati = !compatSnapshot.empty;
            userData.compatCount = compatSnapshot.size;

            // Determină timestamp-ul ultimei compatibilități
            let lastCompatibilityTimestamp = null;
            compatSnapshot.forEach((compatDoc) => {
              const markedAt = compatDoc.data().markedAt;
              if (markedAt) {
                const date = markedAt.toDate ? markedAt.toDate() : new Date(markedAt);
                if (!lastCompatibilityTimestamp || date > lastCompatibilityTimestamp) {
                  lastCompatibilityTimestamp = date;
                }
              }
            });
            userData.lastCompatibility = lastCompatibilityTimestamp;

            // ChatCount
            const chatCount = chatDocs.filter((chatDoc) => chatDoc.id.includes(userData.id)).length;
            userData.chatCount = chatCount;

            return userData;
          })
        );

        // Eliminăm eventualele null (utilizatori fără .responses)
        const validUsersList = usersList.filter((user) => user !== null);

        // Sortare implicită după "registrationDate"
        validUsersList.sort((a, b) => {
          const dateA = new Date(a.registrationDate?.split("-").reverse().join("-"));
          const dateB = new Date(b.registrationDate?.split("-").reverse().join("-"));
          return dateB - dateA;
        });

        setUsers(validUsersList);
        setFilteredUsers(validUsersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };
    fetchUsers();
  }, []);

  // 2. Filtrare și sortare
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompatFilter = !filterNoCompat || (filterNoCompat && !user.hasCompatibilitati);
      const matchesGender = genderFilter === "all" || user.gender?.toLowerCase() === genderFilter;
      const matchesSubscription = !filterSubscription || (filterSubscription && user.subscriptionActive);

      return matchesSearch && matchesCompatFilter && matchesGender && matchesSubscription;
    });

    // Filtru suplimentar: utilizatorii care nu au primit compatibilități de mult timp
    if (filterOldCompat) {
      const now = new Date();
      filtered = filtered.filter((user) => {
        if (!user.lastCompatibility) return true;
        const daysSinceLast = (now - new Date(user.lastCompatibility)) / (1000 * 60 * 60 * 24);
        return daysSinceLast >= oldThresholdDays;
      });
    }

    // Noul filtru: afișează doar utilizatorii care au imagini (dacă e activat)
    if (filterHasImages) {
      filtered = filtered.filter((user) => user.images && Array.isArray(user.images) && user.images.length > 0);
    }

    // Sortare cu prioritate: ultima compatibilitate, lastTimeActive, chatCount, age, compatCount
    if (sortLastCompatOrder) {
      filtered = filtered.sort((a, b) => {
        const timeA = a.lastCompatibility ? a.lastCompatibility.getTime() : 0;
        const timeB = b.lastCompatibility ? b.lastCompatibility.getTime() : 0;
        return sortLastCompatOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    } else if (sortLastActiveOrder) {
      filtered = filtered.sort((a, b) => {
        const aTime = a.lastTimeActive 
          ? (typeof a.lastTimeActive.toDate === "function" 
              ? a.lastTimeActive.toDate().getTime() 
              : new Date(a.lastTimeActive).getTime())
          : 0;
        const bTime = b.lastTimeActive 
          ? (typeof b.lastTimeActive.toDate === "function" 
              ? b.lastTimeActive.toDate().getTime() 
              : new Date(b.lastTimeActive).getTime())
          : 0;
        return sortLastActiveOrder === "asc" ? aTime - bTime : bTime - aTime;
      });
    }
     else if (sortChatOrder) {
      filtered = filtered.sort((a, b) =>
        sortChatOrder === "asc" ? a.chatCount - b.chatCount : b.chatCount - a.chatCount
      );
    } else if (sortAgeOrder) {
      filtered = filtered.sort((a, b) =>
        sortAgeOrder === "asc" ? a.age - b.age : b.age - a.age
      );
    } else if (sortOrder) {
      filtered = filtered.sort((a, b) =>
        sortOrder === "asc" ? a.compatCount - b.compatCount : b.compatCount - a.compatCount
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    users,
    filterNoCompat,
    genderFilter,
    sortOrder,
    filterSubscription,
    sortAgeOrder,
    sortChatOrder,
    sortLastActiveOrder,
    sortLastCompatOrder,
    filterOldCompat,
    filterHasImages, // adăugăm noua dependență pentru filtrul de imagini
  ]);

  // 3. Paginare
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    localStorage.setItem("myCoursesCurrentPage", pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">
              {translatedTexts.listaUtilizatoriText || "Lista Utilizatori"}
            </h1>
          </div>
          <div className="col-auto">
            <input
              type="text"
              placeholder={translatedTexts.searchText || "Caută..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="col-auto">
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="all">Toate</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="col-auto">
            <label>
              <input
                type="checkbox"
                checked={filterNoCompat}
                onChange={() => setFilterNoCompat(!filterNoCompat)}
              />
              {translatedTexts.filterNoCompatText || "Fără compatibilități"}
            </label>
          </div>
          <div className="col-auto">
            <label>
              <input
                type="checkbox"
                checked={filterSubscription}
                onChange={() => setFilterSubscription(!filterSubscription)}
              />
              {translatedTexts.filterSubscriptionText || "Doar utilizatori cu abonament"}
            </label>
          </div>
          {/* Checkbox pentru utilizatorii cu compatibilitate veche */}
          <div className="col-auto">
            <label>
              <input
                type="checkbox"
                checked={filterOldCompat}
                onChange={() => setFilterOldCompat(!filterOldCompat)}
              />
              {translatedTexts.filterOldCompatText || "Compatibilitate veche (>=3 zile)"}
            </label>
          </div>
          {/* Noua opțiune: filtrează doar utilizatorii care au imagini */}
          <div className="col-auto">
            <label>
              <input
                type="checkbox"
                checked={filterHasImages}
                onChange={() => setFilterHasImages(!filterHasImages)}
              />
              {translatedTexts.filterHasImagesText || "Doar utilizatori cu imagini"}
            </label>
          </div>
        </div>

        {/* Afișare utilizatori în tabel */}
        <div className="row y-gap-30 pt-30">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{translatedTexts.profilePicText || "Poză profil"}</th>
                <th>{translatedTexts.userText || "Utilizator"}</th>
                <th onClick={handleSortByAge} style={{ cursor: "pointer" }}>
                  Varsta {sortAgeOrder === "asc" ? "↑" : sortAgeOrder === "desc" ? "↓" : ""}
                </th>
                <th>{translatedTexts.registrationDateText || "Data Înregistrare"}</th>
                <th>{translatedTexts.genText || "Gen"}</th>
                <th onClick={handleSortByCompatCount} style={{ cursor: "pointer" }}>
                  {translatedTexts.compatCountText || "Compatibilități"}
                  {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : ""}
                </th>
                <th onClick={handleSortByChatCount} style={{ cursor: "pointer" }}>
                  Chats {sortChatOrder === "asc" ? " ↑" : sortChatOrder === "desc" ? " ↓" : ""}
                </th>
                <th onClick={handleSortByLastCompat} style={{ cursor: "pointer" }}>
                  Ultima Compatibilitate{" "}
                  {sortLastCompatOrder === "asc" ? "↑" : sortLastCompatOrder === "desc" ? "↓" : ""}
                </th>
                <th onClick={handleSortByLastActive} style={{ cursor: "pointer" }}>
                  Last Active {sortLastActiveOrder === "asc" ? " ↑" : sortLastActiveOrder === "desc" ? " ↓" : ""}
                </th>
                <th>{translatedTexts.contActivText || "Status"}</th>
                <th>{translatedTexts.actiuniText || "Acțiuni"}</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <CoursesCardDashboard data={user} key={user.id} translatedTexts={translatedTexts} />
              ))}
            </tbody>
          </table>
        </div>

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
      </div>
    </div>
  );
}
