import Brands from "@/components/common/Brands";
import PageLinks from "@/components/common/PageLinks";
import PaymentSuccessPage from "@/components/common/PlataFinalizata";
import Preloader from "@/components/common/Preloader";
import QuizClient from "@/components/dashboard/QuizClient";
import FooterOne from "@/components/layout/footers/FooterOne";
import Header from "@/components/layout/headers/Header";
import { fetchTranslation } from "@/utils/translationUtils";
import React from "react";

export default async function Page({ params }) {
  const targetLanguage = params.lang || "en";

  const translatedLinks = {
    home: await fetchTranslation("Acasă", targetLanguage),
    realAmor: await fetchTranslation("Destiny", targetLanguage),
    pricing: await fetchTranslation("Plată finalizată", targetLanguage),
    tarifsText: await fetchTranslation("Tarife", targetLanguage),
    methodeText: await fetchTranslation("Metodă", targetLanguage),
    paymentTitle: await fetchTranslation("Plată Finalizată", targetLanguage),
    paymentText: await fetchTranslation(
      "Vă mulțumim pentru plata efectuată! Vă rugăm să continuați cu rezervarea dumneavoastră.",
      targetLanguage
    ),
    paymentConfirmation: await fetchTranslation(
      "Confirmare de plată",
      targetLanguage
    ),
    loadingText: await fetchTranslation(
      "Se încarcă detaliile plății...",
      targetLanguage
    ),
    successText: await fetchTranslation(
      "Plata dumneavoastră a fost procesată cu succes. Un email cu factura și confirmarea plății a fost trimis la adresa dvs. Vă rugăm să verificați căsuța de email pentru mai multe detalii.",
      targetLanguage
    ),
    continueBookingText: await fetchTranslation(
      "Continuă cu Rezervarea",
      targetLanguage
    ),
    detaliiRezervareText: await fetchTranslation(
      "Detalii rezervare:",
      targetLanguage
    ),
    nameText: await fetchTranslation("Nume", targetLanguage),
    emailText: await fetchTranslation("Email", targetLanguage),
    phoneText: await fetchTranslation("Telefon", targetLanguage),
    amountPaidText: await fetchTranslation("Sumă plătită", targetLanguage),
    signUpText: await fetchTranslation("Înregistrare", targetLanguage),
    logInText: await fetchTranslation("Autentificare", targetLanguage),
    contText: await fetchTranslation("Cont", targetLanguage),
    chestionarText: await fetchTranslation("Chestionar", targetLanguage),
    întrebareaText: await fetchTranslation("Întrebarea", targetLanguage),
    urmatorulText: await fetchTranslation("Următorul", targetLanguage),
    inapoiText: await fetchTranslation("Înapoi", targetLanguage),
    progresText: await fetchTranslation("Progres chestionar", targetLanguage),
    chestionarFinalizatText: await fetchTranslation(
      "Chestionar Finalizat",
      targetLanguage
    ),
    chestionarFinalizatMultiText: await fetchTranslation(
      "Mulțumim pentru completarea chestionarului. Răspunsurile tale au fost înregistrate.",
      targetLanguage
    ),
    chestionarFinalizatSuccesText: await fetchTranslation(
      "Chestionarul a fost finalizat cu succes!",
      targetLanguage
    ),
    chestionarFinalizatPaginaPrincipalaText: await fetchTranslation(
      "Mergi la pagina principală",
      targetLanguage
    ),
    selectOneOptionText: await fetchTranslation(
      "Vă rugăm să selectați cel puțin o opțiune.",
      targetLanguage
    ),
    selectedAnswerText: await fetchTranslation(
      "Vă rugăm să selectați o opțiune.",
      targetLanguage
    ),
    codPostalInvalidText: await fetchTranslation(
      "Cod postal invalid!",
      targetLanguage
    ),
    introductionQuiz1: await fetchTranslation(
      "Bine ați venit în Spațiul Clienților Destiny!",
      targetLanguage
    ),
    introductionQuiz2: await fetchTranslation(
      "Vei începe chestionarul pentru a te cunoaște mai bine! La finalul chestionarului, vei avea posibilitatea de a descărca răspunsurile tale în format PDF. Acestea nu vor fi făcute publice!",
      targetLanguage
    ),
    introductionQuiz3: await fetchTranslation(
      "Vă invităm să răspundeți cât mai sincer la toate întrebările! Este esențial să oferiți răspunsuri corecte pentru a permite un matching care vi se potrivește!",
      targetLanguage
    ),
    introductionQuiz4: await fetchTranslation(
      "Odată completat, algoritmul de compatibilitate va găsi persoanele potrivite pentru tine.",
      targetLanguage
    ),
    introductionQuiz5: await fetchTranslation(
      "Dacă aveți nelămuriri privind modul de funcționare a platformei puteți comunica acest lucru echipei Destiny prin intermediul formularului de contact.",
      targetLanguage
    ),
    introductionQuiz6: await fetchTranslation(
      "Începe chestionarul",
      targetLanguage
    ),
    raspunsPersonalizatText: await fetchTranslation(
      "Introduceți răspunsul personalizat",
      targetLanguage
    ),
    autreText: await fetchTranslation("Altceva", targetLanguage),
    prefereNePasRepondreText: await fetchTranslation(
      "Prefer să nu răspund la întrebare",
      targetLanguage
    ),
  };
  
  return (
    <div className="main-content">
      <Preloader />

      <Header
        tarifsText={translatedLinks.tarifsText}
        methodeText={translatedLinks.methodeText}
        translatedLinks={translatedLinks}
      />
      <div className="content-wrapper js-content-wrapper overflow-hidden">
        {/* <PageLinks
          translatedLinks={translatedLinks}
          link2={"plata-finalizata"}
        /> */}
        <QuizClient
          targetLanguage={targetLanguage}
          translatedLinks={translatedLinks}
        />
        {/* <Brands/> */}
        {/* <FooterOne/> */}
      </div>
    </div>
  );
}
