import React from "react";
import { useRouter } from "next/navigation";

export default function CoursesCardDashboard({ data, translatedTexts }) {
  const router = useRouter();

  const handleCardClick = () => {
    console.log("User Data:", data);
    router.push(`/informatii-utilizator?uid=${data.id}`);
  };

  return (
    <tr onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <td>
        {data.images && data.images.length > 0 ? (
          <img
            src={data.images[0].fileUri}
            alt="Poză profil"
            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          "N/A"
        )}
      </td>
      <td>{data.username}</td>
      <td>{data.age !== undefined ? data.age : "N/A"}</td>
      <td>{data.email ? data.email : "N/A"}</td>
      <td>{data.registrationDate ? data.registrationDate : "N/A"}</td>
      <td>{data.gender ? data.gender : "N/A"}</td>
      <td>{data.compatCount !== undefined ? data.compatCount : 0}</td>
      <td>
        {data.isActivated
          ? translatedTexts.contActivText1
          : translatedTexts.contActivText2}
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
