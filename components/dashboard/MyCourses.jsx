"use client";

import React, { useEffect, useState } from "react";
import { authentication, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import CoursesCardDashboard from "./DashBoardCards/CoursesCardDashboard";
import Pagination from "../common/Pagination";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MyCourses({ translatedTexts }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNoCompat, setFilterNoCompat] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // pentru compatibilități ("asc" sau "desc")
  const [sortAgeOrder, setSortAgeOrder] = useState(null); // pentru vârstă ("asc" sau "desc")
  const [genderFilter, setGenderFilter] = useState("all"); // "all", "male", "female"
  const router = useRouter();

  // Fetch utilizatori și adaugă proprietățile "hasCompatibilitati" și "compatCount"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Users");
        const userSnapshot = await getDocs(usersCollection);
        const usersList = await Promise.all(
          userSnapshot.docs.map(async (doc) => {
            let userData = { id: doc.id, ...doc.data() };

            // Interogăm subcolectia "Compatibilitati" pentru fiecare utilizator
            const compatCollection = collection(db, "Users", doc.id, "Compatibilitati");
            const compatSnapshot = await getDocs(compatCollection);

            console.log(`User ${doc.id} - Compatibilitati count:`, compatSnapshot.size);

            userData.hasCompatibilitati = !compatSnapshot.empty;
            userData.compatCount = compatSnapshot.size;

            return userData;
          })
        );

        // Sortare implicită după "registrationDate"
        usersList.sort((a, b) => {
          const dateA = new Date(a.registrationDate.split("-").reverse().join("-"));
          const dateB = new Date(b.registrationDate.split("-").reverse().join("-"));
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

  // Funcția de sortare pentru compatibilități
  const handleSortByCompatCount = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    // Resetăm sortarea după vârstă dacă se activează sortarea pe compatibilități
    setSortAgeOrder(null);
  };

  // Funcția de sortare pentru vârstă
  const handleSortByAge = () => {
    const newSortAgeOrder = sortAgeOrder === "asc" ? "desc" : "asc";
    setSortAgeOrder(newSortAgeOrder);
    // Resetăm sortarea pe compatibilități dacă se activează sortarea după vârstă
    setSortOrder(null);
  };

  // Filtrare și sortare pe baza searchTerm, filterNoCompat, genderFilter, sortOrder și sortAgeOrder
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompatFilter = !filterNoCompat || (filterNoCompat && !user.hasCompatibilitati);
      const matchesGender = genderFilter === "all" || user.gender?.toLowerCase() === genderFilter;
      return matchesSearch && matchesCompatFilter && matchesGender;
    });

    // Prioritate sortare: sortare după vârstă dacă este setată, altfel după compatCount dacă este setată
    if (sortAgeOrder) {
      filtered = filtered.sort((a, b) => {
        // Se presupune că user.age este numeric (dacă nu, se poate folosi parseInt)
        return sortAgeOrder === "asc" ? a.age - b.age : b.age - a.age;
      });
    } else if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        return sortOrder === "asc" ? a.compatCount - b.compatCount : b.compatCount - a.compatCount;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, filterNoCompat, genderFilter, sortOrder, sortAgeOrder]);

  // Calculul utilizatorilor pentru pagina curentă
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Funcție de paginare
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">
              {translatedTexts.listaUtilizatoriText}
            </h1>
          </div>
          <div className="col-auto">
            <input
              type="text"
              placeholder={translatedTexts.searchText}
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
                <th>{translatedTexts.userText}</th>
                <th onClick={handleSortByAge} style={{ cursor: "pointer" }}>
                  Varsta {sortAgeOrder === "asc" ? "↑" : sortAgeOrder === "desc" ? "↓" : ""}
                </th>
                <th>{translatedTexts.emailText}</th>
                <th>{translatedTexts.registrationDateText}</th>
                <th>{translatedTexts.genText}</th>
                <th onClick={handleSortByCompatCount} style={{ cursor: "pointer" }}>
                  {translatedTexts.compatCountText || "Compatibilități"}
                  {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : ""}
                </th>
                <th>{translatedTexts.contActivText}</th>
                <th>{translatedTexts.actiuniText}</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <CoursesCardDashboard
                  data={user}
                  key={user.id}
                  translatedTexts={translatedTexts}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginare */}
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
