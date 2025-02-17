import React from "react";
import Link from "next/link";
import Preloader from "@/components/common/Preloader";
import FooterOne from "@/components/layout/footers/FooterOne";
import HeaderAuth from "@/components/layout/headers/HeaderAuth";
import AuthImageMove from "@/components/others/AuthImageMove";
import SignUpForm from "@/components/others/SignUpForm";
import { fetchTranslation } from "@/utils/translationUtils";

export default async function Page({ params }) {
  const targetLanguage = params.lang || "fr";

  console.log("targe lagn..", targetLanguage);

  const translatedLinks = {
    termsAndConditionsText: await fetchTranslation(
      "Dând clic pe Înregistrare, accepți Mențiunile legale. Descoperă cum colectăm, folosim și distribuim datele tale citind Politica noastră de confidențialitate și cum folosim cookie-urile și alte tehnologii similare consultând Politica noastră de cookie-uri. Este posibil să primești notificări prin SMS din partea noastră și te poți dezabona oricând.",
      targetLanguage
    ),
    mentionsLegalesText: await fetchTranslation(
      "Mențiunile legale",
      targetLanguage
    ),
    politiqueConfidentialiteText: await fetchTranslation(
      "Politica de confidențialitate",
      targetLanguage
    ),
    politiqueCookiesText: await fetchTranslation(
      "Politica de cookie-uri",
      targetLanguage
    ),
    signUpText: await fetchTranslation("Înregistrare", targetLanguage),
    alreadyHaveAccountText: await fetchTranslation(
      "Ai deja un cont?",
      targetLanguage
    ),
    conectText: await fetchTranslation("Conectează-te", targetLanguage),
    registerText: await fetchTranslation("Înregistrează-te", targetLanguage),
    emailPlaceholder: await fetchTranslation("Email", targetLanguage),
    emailAdresaPlaceholder: await fetchTranslation(
      "Adresă email",
      targetLanguage
    ),
    usernamePlaceholder: await fetchTranslation(
      "Nume utilizator",
      targetLanguage
    ),
    passwordPlaceholder: await fetchTranslation("Parolă", targetLanguage),
    confirmPasswordPlaceholder: await fetchTranslation(
      "Confirmă Parola",
      targetLanguage
    ),
    phonePlaceholder: await fetchTranslation("Telefon", targetLanguage),
    aboutMePlaceholder: await fetchTranslation("Adresa", targetLanguage),
    videoPlaceholder: await fetchTranslation(
      "Adaugă video de prezentare",
      targetLanguage
    ),
    pozePlaceholder: await fetchTranslation(
      "Adaugă poze (prima poză va servi ca poză principală, apasă pe alte poze pentru a schimba poza principală)",
      targetLanguage
    ),
    tarifsText: await fetchTranslation("Tarife", targetLanguage),
    methodeText: await fetchTranslation("Metodă", targetLanguage),
    lang: targetLanguage,
    userNameRequired: await fetchTranslation(
      "Numele de utilizator este necesar",
      targetLanguage
    ),
    passLength: await fetchTranslation(
      "Parola trebuie să aibă cel puțin 6 caractere",
      targetLanguage
    ),
    phoneRequired: await fetchTranslation(
      "Numărul de telefon este necesar",
      targetLanguage
    ),
    addressRequired: await fetchTranslation(
      "Adresa este necesară",
      targetLanguage
    ),
    completeazaCampuri: await fetchTranslation(
      "Te rugăm să completezi toate câmpurile corect.",
      targetLanguage
    ),
    utilizatorInregistrat: await fetchTranslation(
      "Utilizator înregistrat cu succes!",
      targetLanguage
    ),
    signUpText: await fetchTranslation("Înregistrare", targetLanguage),
    logInText: await fetchTranslation("Autentificare", targetLanguage),
    contText: await fetchTranslation("Cont", targetLanguage),
    getNecesarText: await fetchTranslation(
      "Genul este necesar",
      targetLanguage
    ),
    genText: await fetchTranslation("Gen", targetLanguage),
    hommeText: await fetchTranslation("Bărbat", targetLanguage),
    femmeText: await fetchTranslation("Femeie", targetLanguage),
    selecteazaText: await fetchTranslation("Selectează", targetLanguage),
    scopNecesarText: await fetchTranslation(
      "Scopul este necesar",
      targetLanguage
    ),
    scopText: await fetchTranslation("Caut", targetLanguage),
    amourText: await fetchTranslation(
      "Caut un partener de viață pentru o relație serioasă și stabilă.",
      targetLanguage
    ),
    sexText: await fetchTranslation(
      "Caut întâlniri senzuale în deplină discreție.",
      targetLanguage
    ),
    amitieText: await fetchTranslation(
      "Caut să îmi lărgesc cercul de prieteni.",
      targetLanguage
    ),
    termsAndConditions: {
      prefix: await fetchTranslation(
        "Dând clic pe Înregistrare, accepți ",
        targetLanguage
      ),
      mentionsLegalesLinkText: await fetchTranslation(
        "Mențiuni legale",
        targetLanguage
      ),
      mentionsLegalesSuffix: await fetchTranslation(
        ". Descoperă cum colectăm, folosim și distribuim datele tale citind ",
        targetLanguage
      ),
      politiqueConfidentialiteLinkText: await fetchTranslation(
        "Politica de confidențialitate",
        targetLanguage
      ),
      politiqueConfidentialiteSuffix: await fetchTranslation(
        " și cum folosim cookie-urile și alte tehnologii similare consultând ",
        targetLanguage
      ),
      politiqueCookiesLinkText: await fetchTranslation(
        "Politica de cookie-uri",
        targetLanguage
      ),
      suffix: await fetchTranslation(
        ". Este posibil să primești notificări prin SMS din partea noastră și te poți dezabona oricând.",
        targetLanguage
      ),
    },
  };
  
  return (
    <>
      <div className="main-content">
        <Preloader />
        <HeaderAuth
          tarifsText={translatedLinks.tarifsText}
          methodeText={translatedLinks.methodeText}
          translatedLinks={translatedLinks}
        />
        <div className="content-wrapper js-content-wrapper">
          <section className="form-page js-mouse-move-container">
            {/* Afișarea componentei AuthImageMove și a formularului de înregistrare */}

            <section className="form-page js-mouse-move-container">
              {/* Componența AuthImageMove primește răspunsurile ca props */}
              <AuthImageMove />
              {/* Formularul de înregistrare */}
              <SignUpForm
                signUpText={translatedLinks.signUpText}
                alreadyHaveAccountText={translatedLinks.alreadyHaveAccountText}
                conectText={translatedLinks.conectText}
                registerText={translatedLinks.registerText}
                emailPlaceholder={translatedLinks.emailPlaceholder}
                emailAdresaPlaceholder={translatedLinks.emailAdresaPlaceholder}
                usernamePlaceholder={translatedLinks.usernamePlaceholder}
                passwordPlaceholder={translatedLinks.passwordPlaceholder}
                confirmPasswordPlaceholder={
                  translatedLinks.confirmPasswordPlaceholder
                }
                phonePlaceholder={translatedLinks.phonePlaceholder}
                aboutMePlaceholder={translatedLinks.aboutMePlaceholder}
                videoPlaceholder={translatedLinks.videoPlaceholder}
                pozePlaceholder={translatedLinks.pozePlaceholder}
                translatedLinks={translatedLinks}
                targetLanguage={targetLanguage}
              />
            </section>
          </section>
        </div>
      </div>
    </>
  );
}
