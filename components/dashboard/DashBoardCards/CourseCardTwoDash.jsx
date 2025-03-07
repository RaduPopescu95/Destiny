"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function CourseCardTwoDash({
  data,
  translatedTexts,
  compatibilityScore,
  isFreeCard, // indică dacă cardul trebuie să fie în modul freemium (blurat)
}) {
  // Obține imaginea principală
  const mainImage =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images.find((image) => image.isMain)?.fileUri || data.images[0]?.fileUri
      : null;

  // Determină URL-ul de navigare: dacă cardul este free, duce către "/subscriptions",
  // altfel către pagina de compatibilitate
  const hrefLink = isFreeCard
    ? "/subscriptions"
    : `/client-compatibil?uid=${data.id}&cid=${data.compatibilityId}`;

  return (
    <div className="col-xl-3">
      <Link href={hrefLink} className="relative d-block rounded-8 px-10 py-10 border-light">
        <div className="row g-3 align-items-center">
          {/* Container pentru imagine */}
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
                <FontAwesomeIcon icon={faUserCircle} size="4x" className="text-muted" />
              )}
              {/* Mesaj de upgrade pentru cardurile free */}
              {/* {isFreeCard && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                  Upgrade pentru acces complet
                </div>
              )} */}
            </div>
          </div>

          {/* Container pentru text */}
          <div className="col-12 col-md-12">
            <h3 className="text-17 lh-16 fw-500 mt-10 pr-40 xl:pr-0">
              {data.username || "Utilizator"}
            </h3>
            <p>{data.gender ? `${translatedTexts.getText}: ${data.gender}` : ""}</p>
            {compatibilityScore !== undefined && (
              <p className="fw-600">
                {translatedTexts.compatibilityLabel || "Compatibilitate"}: {compatibilityScore}%
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
