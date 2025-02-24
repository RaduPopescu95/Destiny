

// import HomeOne from "@/components/homes/home";
import Header from "../../components/layout/headers/Header";
// import MobileMenu from "@/components/layout/component/MobileMenu";

import HomeHero from "../../components/homes/heros/HomeHero";

import Brands from "../../components/common/Brands";
import Categories from "../../components/homes/categories/Categories";
import Courses from "../../components/homes/courses/Courses";
import TestimonialsOne from "../../components/common/TestimonialsOne";
import FeaturesOne from "../../components/homes/features/FeaturesOne";
import WhyCourse from "../../components/homes/WhyCourse";
import Instructors from "../../components/common/Instructors";
import GetApp from "../../components/homes/getApp/GetApp";
import Blog from "../../components/homes/blogs/Blog";
import Join from "../../components/homes/join/Join";
import FooterNine from "../../components/layout/footers/FooterNine";
import Preloader from "@/components/common/Preloader";


import { fetchTranslation } from "@/utils/translationUtils";
import HeaderAuth from "@/components/layout/headers/HeaderAuth";
import Pricing from "@/components/common/Pricing";
import Subscriptions from "@/components/common/Subscriptions";

// export const metadata = {
//   title:
//     "Home-1 || Educrat - Professional LMS Online Education Course NextJS Template",
//   description:
//     "Elevate your e-learning content with Educrat, the most impressive LMS template for online courses, education and LMS platforms.",
// };

export default async function HomePage({ params }) {
  const targetLanguage = params.lang || "en";

    const translatedLinks = {
      emailText: await fetchTranslation("Email", targetLanguage),
      parolaText: await fetchTranslation("Password", targetLanguage),
      autentificareText: await fetchTranslation("Autentificare", targetLanguage),
      aiContText: await fetchTranslation("Nu ai un cont încă?", targetLanguage),
      inscrieText: await fetchTranslation("Înscrie-te gratuit", targetLanguage),
      tarifsText: await fetchTranslation("Tarifs", targetLanguage),
      methodeText: await fetchTranslation("Methode", targetLanguage),
      lang: targetLanguage,
      autentificareReusita: await fetchTranslation(
        "Autentificare reușită!",
        targetLanguage
      ),
      autentificareEsuata: await fetchTranslation(
        "Autentificare eșuată: ",
        targetLanguage
      ),
      aiUitatParolText: await fetchTranslation(
        "Ai uitat parola? ",
        targetLanguage
      ),
      resetPassText: await fetchTranslation("Reseteaza parola ", targetLanguage),
      signUpText: await fetchTranslation("Sign up", targetLanguage),
      logInText: await fetchTranslation("Log in", targetLanguage),
      contText: await fetchTranslation("Cont", targetLanguage),
         home: await fetchTranslation("Acasa", targetLanguage),
          realAmor: await fetchTranslation("Destiny", targetLanguage),
          pricing: await fetchTranslation("Subscriptions", targetLanguage),
          lang: targetLanguage,
          bookingTextPrim: await fetchTranslation("Abonamente", targetLanguage),
          bookingText: await fetchTranslation(
            "Inscription et accès au compte personnel : gratuit",
            targetLanguage
          ),
          bookingText2: await fetchTranslation(
            "Ouverture de dossier et premier Rendez-vous en présentiel : 159,00€ TVAC",
            targetLanguage
          ),
          paymentOneTimeText: await fetchTranslation(
            "One-time payment for reservations",
            targetLanguage
          ),
          threeMonthsText: await fetchTranslation(
            "Abonnement 1 mois",
            targetLanguage
          ),
          oneTimeFeature1: await fetchTranslation(
            "Création d'un compte personnalisé",
            targetLanguage
          ),
          oneTimeFeature2: await fetchTranslation(
            "Questions et Test de Personnalité",
            targetLanguage
          ),
          oneTimeFeature3: await fetchTranslation(
            "Rendez-vous en présentiel",
            targetLanguage
          ),
          oneTimeFeature4: await fetchTranslation(
            "Accès à la communauté Destiny",
            targetLanguage
          ),
          oneTimeFeature5: await fetchTranslation(
            "Réunion pluridisciplinaire Destiny pour discuter de votre profil",
            targetLanguage
          ),
          oneTimeFeature6: await fetchTranslation(
            "Contact avec les profils compatibles via votre compte",
            targetLanguage
          ),
          oneTimeFeature7: await fetchTranslation(
            "Présentation de chaque profil compatible par un de nos conseillers (téléphone)",
            targetLanguage
          ),
          oneTimeFeature8: await fetchTranslation(
            "Conseils des l'équipe de Destiny pour améliorer vos chances de réussite",
            targetLanguage
          ),
          getStarted: await fetchTranslation("Începe acum", targetLanguage),
          tarifsText: await fetchTranslation("Tarifs", targetLanguage),
          methodeText: await fetchTranslation("Methode", targetLanguage),
      
          // Traducerea textului pentru bifa termenilor și condițiilor
          acceptTermsText: await fetchTranslation(
            "Accept Terms and Conditions, Privacy Policy, and Cookies",
            targetLanguage
          ),
          abonament12: await fetchTranslation("Abonnement 12 mois", targetLanguage),
          abonament3: await fetchTranslation("Abonnement 1 mois", targetLanguage),
          monthText: await fetchTranslation("month", targetLanguage),
          signUpText: await fetchTranslation("Sign up", targetLanguage),
          logInText: await fetchTranslation("Log in", targetLanguage),
          contText: await fetchTranslation("Cont", targetLanguage),
          //NOI
          legaturiText: await fetchTranslation("Creează Legături Autentice Online cu ", targetLanguage),
          construiesteText: await fetchTranslation("Construiește relații autentice prin conversații, compatibilități și conexiuni online ", targetLanguage),
          construiesteTex2: await fetchTranslation("cu oameni din toată lumea.", targetLanguage),
          ctaText: await fetchTranslation("Începe acum", targetLanguage),
          heroTitleText: await fetchTranslation("Creează Legături Autentice Online cu ", targetLanguage),
          descoperaText: await fetchTranslation("Descoperă", targetLanguage),
          descoperaText2: await fetchTranslation("oportunități unice de conectare, oriunde și oricând.", targetLanguage),
          descoperaText3: await fetchTranslation("Explorați lista de mai jos pentru a descoperi beneficiile exclusive pe care platforma noastră vi le pune la dispoziție.", targetLanguage),
          descoperaText4: await fetchTranslation("Înregistrează-te gratuit", targetLanguage),
          elmText: await fetchTranslation("Profiluri verificate", targetLanguage),
          elmText1: await fetchTranslation("Compatibilități reale", targetLanguage),
          elmText2: await fetchTranslation("Conexiuni autentice", targetLanguage),
          elmText3: await fetchTranslation("Confidențialitate garantată", targetLanguage),
          whyComponent: await fetchTranslation("Cum functioneaza", targetLanguage),
          stepsComponent: await fetchTranslation("01. Înregistrează-te", targetLanguage),
          stepsComponent1_1: await fetchTranslation("Creează-ți un cont rapid și ușor pentru a începe căutarea partenerului ideal.", targetLanguage),
          stepsComponent2: await fetchTranslation("02. Răspunde la întrebări", targetLanguage),
          stepsComponent2_1: await fetchTranslation("Completează un set de întrebări personalizate pentru a identifica compatibilitățile potrivite.", targetLanguage),
          stepsComponent3: await fetchTranslation("03. Compatibilități verificate", targetLanguage),
          stepsComponent3_1: await fetchTranslation("Experții noștri analizează compatibilitățile tale și îți oferă cele mai bune potriviri.", targetLanguage),
          whatTheyThinkText: await fetchTranslation("Ce cred utilizatorii despre noi", targetLanguage),
          countersText1: await fetchTranslation("Membri activi lunar", targetLanguage),
          countersText2: await fetchTranslation("Conversații inițiate", targetLanguage),
          countersText3: await fetchTranslation("Întâlniri reușite", targetLanguage),
          countersText4: await fetchTranslation("Rată de compatibilitate", targetLanguage),
          joinText1: await fetchTranslation("Alătură-te celor peste", targetLanguage),
          joinText2: await fetchTranslation("8 milioane de persoane", targetLanguage),
          joinText3: await fetchTranslation("care caută conexiuni autentice bazate pe astrologie și numerologie", targetLanguage),
          joinText4: await fetchTranslation("Conectează-te cu persoanele potrivite!", targetLanguage),
          acasaText: await fetchTranslation("Acasa", targetLanguage),
        };
        

  return (
    <>
      <Preloader />
   
         <Header
           tarifsText={translatedLinks.tarifsText}
           methodeText={translatedLinks.methodeText}
           translatedLinks={translatedLinks}
         />

      <div className="content-wrapper  js-content-wrapper overflow-hidden">
      <HomeHero translatedLinks={translatedLinks}/> 
         {/* <Brands /> */}
        {/* <Categories /> */}
        {/* <Courses /> */}
        <FeaturesOne translatedLinks={translatedLinks}/>
        <WhyCourse translatedLinks={translatedLinks}/>
        <TestimonialsOne translatedLinks={translatedLinks}/>
    {/* <Subscriptions
          bookingText={translatedLinks.bookingText}
          paymentOneTimeText={translatedLinks.paymentOneTimeText}
          oneTimeFeature1={translatedLinks.oneTimeFeature1}
          oneTimeFeature2={translatedLinks.oneTimeFeature2}
          oneTimeFeature3={translatedLinks.oneTimeFeature3}
          oneTimeFeature4={translatedLinks.oneTimeFeature4}
          getStarted={translatedLinks.getStarted}
          acceptTermsText={translatedLinks.acceptTermsText}
          translatedLinks={translatedLinks}
        /> */}
        {/* <Instructors /> */}
        {/* <GetApp /> */}
        {/* <Blog /> */}
        <Join translatedLinks={translatedLinks}/>
        <FooterNine translatedLinks={translatedLinks}/>
      </div>
    </>
  );
}
