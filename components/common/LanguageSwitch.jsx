import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

const LanguageSwitch = ({ closePopup }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // Preia calea curentă a paginii
  const router = useRouter(); // Folosește router pentru navigare
  const { changeLanguage } = useAuth(); // Funcția pentru schimbarea limbii din context
  const dropdownRef = useRef(null);

  const flagImages = {
    bg: "/assets/img/flags/bulgaria.png",     // Bulgaria
    hr: "/assets/img/flags/croatia.png",      // Croatia
    cz: "/assets/img/flags/czech.png",        // Czech
    en: "/assets/img/flags/english.png",      // English
    fr: "/assets/img/flags/france.png",       // France
    de: "/assets/img/flags/germany.png",      // Germany
    gr: "/assets/img/flags/greece.png",       // Greece
    in: "/assets/img/flags/india.png",        // India
    id: "/assets/img/flags/indonesia.png",    // Indonesia
    it: "/assets/img/flags/italy.png",        // Italy
    nl: "/assets/img/flags/netherlands.png",  // Netherlands
    pl: "/assets/img/flags/poland.png",       // Poland
    ro: "/assets/img/flags/romania.png",      // Romania
    sk: "/assets/img/flags/slovakia.png",     // Slovakia
    es: "/assets/img/flags/spanish.png",      // Spanish
  };

  useEffect(() => {
    // Obține limba salvată din cookie sau setează limba implicită la "fr"
    const savedLocale = Cookies.get("NEXT_LOCALE") || "ro";
    // const savedLocale = "ro";
    changeLanguage(savedLocale); // Setăm limba curentă
  }, []);

  const toggleDropdown = () => setOpen(!open);

  const changeLang = (newLocale) => {
    // Salvăm limba în cookies
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 }); // Limba e salvată pentru 1 an
    changeLanguage(newLocale); // Schimbăm limba în context

    // Eliminăm prefixul de limbă din calea curentă
    const supportedLangs = "bg|hr|cz|en|fr|de|gr|in|id|it|nl|pl|ro|sk|es";
    const currentPath = pathname.replace(new RegExp(`^\\/(${supportedLangs})(\\/|$)`), "/");
    
    // Navigăm către noul URL cu limba selectată, dar fără adăugarea duplicată a limbii
    const newPath = `/${newLocale}${currentPath}`.replace(/\/\//g, "/");

    // Folosim router.push pentru a redirecționa către noua cale
    router.push(newPath);
    setOpen(false); // Închidem dropdown-ul
  };

  // Închidem dropdown-ul dacă facem clic în afara componentului
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="language-switch" ref={dropdownRef}>
      <div className="language-switch-btn" onClick={toggleDropdown}>
        <img
          src={flagImages[pathname.split("/")[1] || "ro"]} // Limba implicită e "fr"
          alt="Language"
          width={30}
          height={30}
        />
      </div>

      {open && (
        <ul className="dropdown-menu">
          {Object.keys(flagImages).map((lang) => (
            <li
              key={lang}
              className={`dropdown-item ${
                lang === (pathname.split("/")[1] || "ro") ? "active" : ""
              }`}
              onClick={() => changeLang(lang)}
            >
              <img src={flagImages[lang]} alt={lang} width={20} height={20} />
              <span>{lang.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

LanguageSwitch.propTypes = {
  closePopup: PropTypes.func,
};

export default LanguageSwitch;
