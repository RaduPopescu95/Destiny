"use client";

import "../public/assets/sass/styles.scss";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-calendar/dist/Calendar.css";
config.autoAddCss = false;

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import Context from "@/context/Context";
import { AuthProvider } from "@/context/AuthContext";

import Cookies from "js-cookie";
import { GoogleTagManager } from "@next/third-parties/google";
import LanguageModal from "@/components/common/LanguageModal";
import FloatingChatButton from "@/components/contactSupport/FloatingChatButton ";
import { fetchTranslation } from "@/utils/translationUtils";

// Importă componenta noastră


export default  function RootLayout({ children }) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    AOS.init({
      duration: 700,
      offset: 120,
      easing: "ease-out",
      once: true,
    });

    // Verificăm limba salvată sau folosim "fr"
    const savedLocale = Cookies.get("NEXT_LOCALE") || "fr";
    setLang(savedLocale);
  }, []);



  return (
    <html lang={lang}>
      <GoogleTagManager gtmId="G-RZ4DR59LZ5" />
      <head></head>
      <body>
        <Context>
          <AuthProvider>
            {children}
            <FloatingChatButton />
            {/* Afișăm modalul global, care apare la prima accesare */}
            <LanguageModal />
          </AuthProvider>
        </Context>
      </body>
    </html>
  );
}
