"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGem, faUserCircle } from "@fortawesome/free-solid-svg-icons";

export default function CourseCardTwoDash({
  data,
  translatedTexts,
  compatibilityScore,
  isFreeCard,      // indică dacă cardul trebuie să fie în modul freemium (blurat)
  premiumAccount,   // indică dacă userul are abonament premium
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Obține imaginea principală
  const mainImage =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images.find((image) => image.isMain)?.fileUri || data.images[0]?.fileUri
      : null;

  // Determină URL-ul de navigare
  const hrefLink = isFreeCard
    ? "/subscriptions"
    : `/client-compatibil?uid=${data.id}&cid=${data.compatibilityId}`;

  // Stiluri inline pentru containerul iconiței de premium
  const premiumGemContainerStyle = {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    zIndex: 10,
    padding: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "50%",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
    cursor: "pointer", // Indică faptul că elementul e "hoverable"
  };

  // Stiluri inline pentru tooltip
  const premiumTooltipStyle = {
    position: "absolute",
    bottom: "110%", // Poți ajusta poziția în sus/jos
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
    fontSize: "13px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.4)",
    pointerEvents: "none", // astfel încât să nu se întrerupă hover-ul
    opacity: showTooltip ? 1 : 0,
    transition: "opacity 0.2s",
  };

  return (
    <div className="col-xl-3"   onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}>
      <Link
        href={hrefLink}
        className="relative d-block rounded-8 px-10 py-10 border-light"
      >
        {/* Iconiță premium (faGem) + tooltip */}
        {premiumAccount && (
          <div
            style={premiumGemContainerStyle}
          
          >
            <FontAwesomeIcon
              icon={faGem}
              style={{
                fontSize: "24px",
                color: "gold",
              }}
            />
            {/* Tooltipul apare doar când starea showTooltip == true */}
            <div style={premiumTooltipStyle}>
              Această compatibilitate a fost realizată datorită abonamentului premium
            </div>
          </div>
        )}

        <div className="row g-3 align-items-center">
          {/* Container imagine */}
          <div className="col-12 col-md-12">
            <div
              className={`overflow-hidden rounded-8 w-100 d-flex justify-center align-items-center bg-light ${
                isFreeCard ? "blurred" : ""
              }`}
              style={{ position: "relative", aspectRatio: "16/9" }}
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt="imagine"
                  fill
                  className="rounded-8"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUserCircle}
                  size="4x"
                  className="text-muted"
                />
              )}
            </div>
          </div>

          {/* Container text */}
          <div className="col-12 col-md-12">
            <h3 className="text-17 lh-16 fw-500 mt-10 pr-40 xl:pr-0">
              {data.username || "Utilizator"}
            </h3>
            <p>
              {data.gender
                ? `${translatedTexts.getText}: ${data.gender}`
                : ""}
            </p>
            {compatibilityScore !== undefined && (
              <p className="fw-600">
                {(translatedTexts.compatibilityLabel ?? "Compatibilitate") + ": "}
                {compatibilityScore}%
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
