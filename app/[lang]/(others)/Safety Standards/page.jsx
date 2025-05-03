




import PageLinks from '@/components/common/PageLinks'
import Preloader from '@/components/common/Preloader'
import FooterNine from '@/components/layout/footers/FooterNine'

import FooterOne from '@/components/layout/footers/FooterOne'
import Header from '@/components/layout/headers/Header'
import Terms from '@/components/terms/Terms'
import PrivacyPolicy from '@/components/terms/TermsConfidentialitate'
import { fetchTranslation } from '@/utils/translationUtils'
import React from 'react'
export const metadata = {
  title: 'Destiny',
  description:
    'Destiny',
  
}
export default async function page({params}) {
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
                "Îți dorești să-ți crești șansele de a obține o compatibilitate? Abonamentul nostru reprezintă o funcție exclusivă pentru abonații Destiny, care te ajută să te asiguri că profilul tau este văzut mai repede de o potențială compatibilitate, înainte de profilurile celor non-abonați.",
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
  
<div className="main-content">
  <Preloader/>

  <Header tarifsText={translatedLinks.tarifsText}
          methodeText={translatedLinks.methodeText}
          translatedLinks={translatedLinks}/>

  <div className="content-wrapper js-content-wrapper overflow-hidden">
    <FooterNine/>

    <div className="container py-20 px-4 md:px-20">
      <h2 className="text-3xl font-semibold mb-6">YDestiny – Safety Standards</h2>

      <p className="mb-4">
        At YDestiny, the safety and well-being of our users are our top priorities. As a platform in the <strong>dating and social</strong> category, we are committed to protecting our community, particularly minors, and preventing all forms of abuse and exploitation.
      </p>

      <h3 className="text-xl font-bold mt-6 mb-2">👤 Minimum Age Requirement</h3>
      <p className="mb-4">
        YDestiny is <strong>strictly intended for users aged 18 and older</strong>. We do not permit access to minors under any circumstances. Age restrictions are clearly stated and enforced at account creation.
      </p>

      <h3 className="text-xl font-bold mt-6 mb-2">🛡️ Protection Against Child Sexual Abuse and Exploitation (CSAE)</h3>
      <p className="mb-4">
        We maintain a <strong>zero-tolerance policy</strong> toward any form of child sexual abuse material (CSAM), grooming, or child exploitation. We actively monitor for such content, and:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Immediately <strong>remove</strong> any offending content,</li>
        <li><strong>Permanently ban</strong> accounts involved,</li>
        <li><strong>Report violations</strong> to relevant law enforcement authorities and child safety organizations.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-2">🚨 User Reporting & Moderation</h3>
      <p className="mb-4">
        YDestiny includes built-in features that allow users to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Report profiles</strong> or messages that violate our standards,</li>
        <li><strong>Block users</strong> who engage in inappropriate or harmful behavior.</li>
      </ul>
      <p className="mb-4">
        Reports are reviewed promptly by our moderation team, and appropriate action is taken, including warnings, suspensions, or bans.
      </p>

      <h3 className="text-xl font-bold mt-6 mb-2">🤝 Community Safety Commitment</h3>
      <p className="mb-4">
        To promote a safe environment, we:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Educate users about <strong>safe online dating</strong> through in-app tips and content,</li>
        <li>Review and moderate user-generated content and interactions,</li>
        <li>Implement technical safeguards to prevent harmful behavior.</li>
      </ul>

      <h3 className="text-xl font-bold mt-6 mb-2">📩 Contact Us</h3>
      <p className="mb-2">
        If you have questions, concerns, or wish to report unsafe behavior or content, please contact us:
      </p>
      <p className="font-medium">📧 contact@ydestiny.com și mobitoolsro@gmail.com</p>

      <p className="text-sm text-gray-500 mt-6">
        *This page is part of our compliance with Google Play’s <a href="https://support.google.com/googleplay/android-developer/answer/14747720" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">Child Safety Standards</a>.*
      </p>
    </div>
  </div>
</div>
  )
}
