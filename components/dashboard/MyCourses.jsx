"use client";

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

  // Filtre și stări de sortare
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNoCompat, setFilterNoCompat] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);      // pentru compatCount
  const [sortAgeOrder, setSortAgeOrder] = useState(null); // pentru age
  const [sortChatOrder, setSortChatOrder] = useState(null); // pentru chatCount
  const [sortLastActiveOrder, setSortLastActiveOrder] = useState(null); // pentru lastTimeActive
  const [genderFilter, setGenderFilter] = useState("all"); // "all", "male", "female"

  const router = useRouter();

  // Funcție pentru toggle sortarea după chatCount
  const handleSortByChatCount = () => {
    const newOrder = sortChatOrder === "asc" ? "desc" : "asc";
    setSortChatOrder(newOrder);
    // Resetăm celelalte tipuri de sortare
    setSortOrder(null);
    setSortAgeOrder(null);
    setSortLastActiveOrder(null);
  };

  // Funcție pentru generarea unui chatId, nu neapărat folosită aici, dar e în cod
  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}-${uid2}` : `${uid2}-${uid1}`;
  };

  // Funcție pentru toggle sortarea după lastTimeActive
  const handleSortByLastActive = () => {
    const newOrder = sortLastActiveOrder === "asc" ? "desc" : "asc";
    setSortLastActiveOrder(newOrder);
    // Resetăm celelalte sortări
    setSortOrder(null);
    setSortAgeOrder(null);
    setSortChatOrder(null);
  };

  // 1. Fetch utilizatori + calcule chatCount (similar codului tău)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Users");
        const userSnapshot = await getDocs(usersCollection);

        // 2. Documentele din colecția Chats
        const chatsCollection = collection(db, "Chats");
        const chatsSnapshot = await getDocs(chatsCollection);
        const chatDocs = chatsSnapshot.docs;

        // 3. Construim usersList cu datele necesare
        const usersList = await Promise.all(
          userSnapshot.docs.map(async (docSnap) => {
            let userData = { id: docSnap.id, ...docSnap.data() };

            // (Opțional) compatCount
            const compatCollection = collection(db, "Users", docSnap.id, "Compatibilitati");
            const compatSnapshot = await getDocs(compatCollection);
            userData.hasCompatibilitati = !compatSnapshot.empty;
            userData.compatCount = compatSnapshot.size;

            // (Opțional) chatCount
            const chatCount = chatDocs.filter((chatDoc) => {
              return chatDoc.id.includes(userData.id);
            }).length;
            userData.chatCount = chatCount;

            // 4. lastTimeActive - ar trebui să fie un Date, un string, sau un Firestore Timestamp
            // Dacă tu salvezi direct un Date, atunci userData.lastTimeActive e un obiect Date.
            // Dacă salvezi un Firestore Timestamp, trebuie să faci .toDate() la momentul fetch-ului.
            // Presupunem că e deja un string data (ex. "2025-05-03T10:30:00Z") sau un date numeric.
            // Fie îl convertești mai jos, fie la afișare.
            // userData.lastTimeActive ar putea fi deja definit în docSnap.data().
            
            return userData;
          })
        );

        // Sortare implicită după "registrationDate" 
        usersList.sort((a, b) => {
          const dateA = new Date(a.registrationDate?.split("-").reverse().join("-"));
          const dateB = new Date(b.registrationDate?.split("-").reverse().join("-"));
          return dateB - dateA;
        });

        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };
    fetchUsers();
  }, []);

  // 5. Filtrare și sortare
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompatFilter = !filterNoCompat || (filterNoCompat && !user.hasCompatibilitati);
      const matchesGender = genderFilter === "all" || user.gender?.toLowerCase() === genderFilter;
      return matchesSearch && matchesCompatFilter && matchesGender;
    });

    // Logica de sortare, cu prioritate: lastTimeActive, chatCount, age, compatCount
    if (sortLastActiveOrder) {
      filtered = filtered.sort((a, b) => {
        // Convertește la Date (dacă e string)
        const dateA = new Date(a.lastTimeActive);
        const dateB = new Date(b.lastTimeActive);

        // Dacă vrei ca "asc" să însemne date mai vechi -> date mai noi:
        if (sortLastActiveOrder === "asc") {
          return dateA - dateB;  // mai vechi primele
        } else {
          return dateB - dateA;  // mai noi primele
        }
      });
    } else if (sortChatOrder) {
      filtered = filtered.sort((a, b) => {
        return sortChatOrder === "asc" ? a.chatCount - b.chatCount : b.chatCount - a.chatCount;
      });
    } else if (sortAgeOrder) {
      filtered = filtered.sort((a, b) => {
        return sortAgeOrder === "asc" ? a.age - b.age : b.age - a.age;
      });
    } else if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        return sortOrder === "asc" ? a.compatCount - b.compatCount : b.compatCount - a.compatCount;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    users,
    filterNoCompat,
    genderFilter,
    sortOrder,
    sortAgeOrder,
    sortChatOrder,
    sortLastActiveOrder,
  ]);

  // Paginare
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Alte sortări deja existente
  const handleSortByCompatCount = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setSortAgeOrder(null);
    setSortChatOrder(null);
    setSortLastActiveOrder(null);
  };
  const handleSortByAge = () => {
    const newSortAgeOrder = sortAgeOrder === "asc" ? "desc" : "asc";
    setSortAgeOrder(newSortAgeOrder);
    setSortOrder(null);
    setSortChatOrder(null);
    setSortLastActiveOrder(null);
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
                <th>{translatedTexts.emailText || "Email"}</th>
                <th>{translatedTexts.registrationDateText || "Data Înregistrare"}</th>
                <th>{translatedTexts.genText || "Gen"}</th>
                <th onClick={handleSortByCompatCount} style={{ cursor: "pointer" }}>
                  {translatedTexts.compatCountText || "Compatibilități"}
                  {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : ""}
                </th>
                <th onClick={handleSortByChatCount} style={{ cursor: "pointer" }}>
                  Chats
                  {sortChatOrder === "asc" ? " ↑" : sortChatOrder === "desc" ? " ↓" : ""}
                </th>
                {/* Noua coloană: Last Active */}
                <th onClick={handleSortByLastActive} style={{ cursor: "pointer" }}>
                  Last Active
                  {sortLastActiveOrder === "asc" ? " ↑" : sortLastActiveOrder === "desc" ? " ↓" : ""}
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
