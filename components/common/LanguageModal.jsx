"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

// Aceleași flaguri ca în LanguageSwitch:
const flagImages = {
  bg: "/assets/img/flags/bulgaria.png",    // Bulgaria
  hr: "/assets/img/flags/croatia.png",     // Croatia
  cs: "/assets/img/flags/czech.png",       // Czech
  en: "/assets/img/flags/english.png",     // English
  fr: "/assets/img/flags/france.png",      // France
  de: "/assets/img/flags/germany.png",     // Germany
  el: "/assets/img/flags/greece.png",      // Greece
  hi: "/assets/img/flags/india.png",       // India (limba hindi)
  id: "/assets/img/flags/indonesia.png",   // Indonesia
  it: "/assets/img/flags/italy.png",       // Italy
  nl: "/assets/img/flags/netherlands.png", // Netherlands
  pl: "/assets/img/flags/poland.png",      // Poland
  ro: "/assets/img/flags/romania.png",     // Romania
  sk: "/assets/img/flags/slovakia.png",    // Slovakia
  es: "/assets/img/flags/spanish.png",     // Spanish
};

export default function LanguageModal() {
  const [showModal, setShowModal] = useState(false);
  const { changeLanguage } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Afișăm modalul doar la prima accesare (dacă nu există cookie "seenLanguageModal")
  useEffect(() => {
    const wasShown = Cookies.get("seenLanguageModal");
    if (!wasShown) {
      setShowModal(true);
      // setăm cookie 30 zile (sau cât vrei)
      Cookies.set("seenLanguageModal", "true", { expires: 30 });
    }
  }, []);

  // Schimbă limba și redirect + închide modalul
  const handleSelectLanguage = (lang) => {
    Cookies.set("NEXT_LOCALE", lang, { expires: 365 });
    changeLanguage(lang);

    // Elimină codul de limbă anterior din path
    const supportedLangs = Object.keys(flagImages).join("|");
    const currentPath = pathname.replace(
      new RegExp(`^(\\/(${supportedLangs}))+`, "i"),
      "/"
    );

    // Construim noua cale cu prefix /lang
    const newPath = `/${lang}${currentPath}`.replace(/\/\//g, "/");
    router.push(newPath);

    setShowModal(false);
  };

  // Închide manual modalul (fără să schimbi limba)
  const handleClose = () => {
    setShowModal(false);
  };

  // Dacă nu trebuie afișat, nu redăm nimic
  if (!showModal) return null;

  return (
    <div className="language-modal-overlay">
      <div className="language-modal-content">
        <h2>Language</h2>

        <div className="language-modal-grid">
          {Object.entries(flagImages).map(([langCode, flagSrc]) => (
            <button
              key={langCode}
              className="language-modal-item"
              onClick={() => handleSelectLanguage(langCode)}
            >
              <img src={flagSrc} alt={langCode} width={24} height={24} />
              <span>{langCode.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* <button className="language-modal-close" onClick={handleClose}>
          Close
        </button> */}
      </div>
    </div>
  );
}
