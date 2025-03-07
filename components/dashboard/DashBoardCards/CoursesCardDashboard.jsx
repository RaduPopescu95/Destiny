"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function CoursesCardDashboard({ data, translatedTexts }) {
  const router = useRouter();

  const handleCardClick = () => {
    console.log("User Data:", data);
    router.push(`/informatii-utilizator?uid=${data.id}`);
  };

  // Conversie lastTimeActive la un format frumos
  let lastActiveDisplay = "N/A";
  if (data.lastTimeActive) {
    try {
      const d = data.lastTimeActive.toDate
        ? data.lastTimeActive.toDate()
        : new Date(data.lastTimeActive);
      lastActiveDisplay = d.toLocaleString();
    } catch (err) {
      console.error("Eroare conversie lastTimeActive:", err);
    }
  }

  // Conversie lastCompatibility la un format frumos
  let lastCompatDisplay = "N/A";
  if (data.lastCompatibility) {
    try {
      const d = data.lastCompatibility.toDate
        ? data.lastCompatibility.toDate()
        : new Date(data.lastCompatibility);
      lastCompatDisplay = d.toLocaleString();
    } catch (err) {
      console.error("Eroare conversie lastCompatibility:", err);
    }
  }
  return (
    <tr style={{ cursor: "pointer" }}>
      <td>
        {data.images && data.images.length > 0 ? (
          <img
            src={data.images[0].fileUri}
            alt="Poză profil"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          "N/A"
        )}
      </td>
      <td>{data.username}</td>
      <td>{data.age !== undefined ? data.age : "N/A"}</td>
      {/* <td>{data.email ? data.email : "N/A"}</td> */}
      <td>{data.registrationDate ? data.registrationDate : "N/A"}</td>
      <td>{data.gender ? data.gender : "N/A"}</td>
      <td>{data.compatCount !== undefined ? data.compatCount : 0}</td>
      <td>{data.chatCount !== undefined ? data.chatCount : 0}</td>
      {/* Coloana pentru ultima compatibilitate */}
      <td>{lastCompatDisplay}</td>
      {/* Coloana pentru lastTimeActive */}
      <td>{lastActiveDisplay}</td>
      <td>
        {data.subscriptionActive
          ? "Are abonament"
          : "Nu Are abonament"}
      </td>
      <td>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="btn btn-primary"
        >
          {translatedTexts.veziDetaliiText}
        </button>
      </td>
    </tr>
  );
}
