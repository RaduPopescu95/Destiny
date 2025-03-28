import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaComment, FaTimes } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";
import { fetchTranslation } from "@/utils/translationUtils";

const FloatingChatButton = () => {
  // Obținem targetLanguage din URL sau implicit "ro"
  const params = useParams();
  const targetLanguage = params.lang || "ro";

  // Stări pentru traduceri și UI
  const [translations, setTranslations] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  // Stare pentru metoda de contact: "email" sau "whatsapp"
  const [contactPreference, setContactPreference] = useState("email");

  // Ascundem tooltip-ul după 2 secunde
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Se încarcă traducerile necesare
  useEffect(() => {
    const fetchTranslations = async () => {
      const t = {
        chatTooltip: await fetchTranslation(
          "Pentru orice probleme în folosirea aplicației, vă rugăm să ne contactați.",
          targetLanguage
        ),
        chatHeader: await fetchTranslation("Suport Chat", targetLanguage),
        subjectPlaceholder: await fetchTranslation("Subiect", targetLanguage),
        emailPlaceholder: await fetchTranslation("Email", targetLanguage),
        messagePlaceholder: await fetchTranslation("Conținut mesaj", targetLanguage),
        submitButton: await fetchTranslation("Trimite", targetLanguage),
        gdprPrefix: await fetchTranslation(
          "Prin trimiterea mesajului, sunteți de acord cu prelucrarea datelor dumneavoastră conform ",
          targetLanguage
        ),
        gdprPrivacyLink: await fetchTranslation("Politica de confidențialitate", targetLanguage),
        gdprCookiesLink: await fetchTranslation("Politica de cookie-uri", targetLanguage),
        gdprSuffix: await fetchTranslation(".", targetLanguage),
        emailError: await fetchTranslation("Vă rugăm să completați adresa de email.", targetLanguage),
        gdprError: await fetchTranslation("Trebuie să acceptați prelucrarea datelor conform GDPR.", targetLanguage),
        contactConfirmationEmail: await fetchTranslation("Vă vom contacta pe email.", targetLanguage),
        errorSubmit: await fetchTranslation("A apărut o eroare. Încercați din nou.", targetLanguage),
        // Mesaj informativ pentru WhatsApp
        whatsappInfo: await fetchTranslation(
          "Pentru mesajele trimise prin WhatsApp, răspundem de regulă de luni până vineri, între orele 08:00 și 16:00. În afara acestui interval, răspunsul poate fi întârziat.",
          targetLanguage
        ),
        consentButtonDisabled: await fetchTranslation(
          "Pentru a trimite mesajul este necesar să acceptați politicile noastre prin bifarea căsuței de mai sus.",
          targetLanguage
        ),
      };
      setTranslations(t);
    };

    fetchTranslations();
  }, [targetLanguage]);

  const toggleChat = () => setShowChat(!showChat);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificare GDPR (acordul este necesar pentru ambele metode)
    if (!gdprConsent) {
      setStatusMessage(translations.gdprError);
      return;
    }

    if (contactPreference === "email") {
      if (!email) {
        setStatusMessage(translations.emailError);
        return;
      }
      try {
        await addDoc(collection(db, "chatMessages"), {
          subject,
          email,
          message,
          contactPreference: "email",
          gdprConsent,
          timestamp: new Date()
        });
        setStatusMessage(translations.contactConfirmationEmail);
        setSubject("");
        setEmail("");
        setMessage("");
        setGdprConsent(false);
        setTimeout(() => {
          setStatusMessage("");
          setShowChat(false);
        }, 3000);
      } catch (error) {
        console.error("Eroare la trimiterea mesajului: ", error);
        setStatusMessage(translations.errorSubmit);
      }
    } else if (contactPreference === "whatsapp") {
      const text = `Subiect: ${subject}\nMesaj: ${message}`;
      const encodedText = encodeURIComponent(text);
      const phone = "40750282034"; // Format internațional pentru România
      const url = `https://wa.me/${phone}?text=${encodedText}`;
      window.open(url, "_blank");
    }
  };

  if (!translations) {
    return <div>Loading translations...</div>;
  }

  return (
    <>
      <div className="floating-chat-container">
        <button className="floating-chat-button" onClick={toggleChat}>
          <FaComment size={24} />
        </button>
        {showTooltip && <div className="chat-tooltip">{translations.chatTooltip}</div>}
      </div>

      {showChat && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>{translations.chatHeader}</span>
            <button className="close-button" onClick={toggleChat}>
              <FaTimes size={18} />
            </button>
          </div>
          <div className="chat-body">
            {statusMessage ? (
              <div className="status-message">{statusMessage}</div>
            ) : (
              <form className="chat-form" onSubmit={handleSubmit}>
                {/* Selector pentru metoda de contact */}
                <div className="contact-preference">
                  <label>
                    Metoda de contact:
                    <select
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value)}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </label>
                </div>
                {/* Mesaj informativ pentru WhatsApp */}
                {contactPreference === "whatsapp" && (
                  <div className="whatsapp-info">
                    <p>{translations.whatsappInfo}</p>
                  </div>
                )}
                <input
                  type="text"
                  placeholder={translations.subjectPlaceholder}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                {contactPreference === "email" && (
                  <input
                    type="email"
                    placeholder={translations.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                )}
                <textarea
                  placeholder={translations.messagePlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>

                <div className="col-12">
                  <label className="text-14">
                  <input
  type="checkbox"
  checked={gdprConsent}
  onChange={() => setGdprConsent(!gdprConsent)}
  style={{
    width: "24px",          // crește lățimea
    height: "24px",         // crește înălțimea
    accentColor: gdprConsent ? "#28a745" : "#d9534f",  // culoare verde când este bifată, roșie când nu e bifată
    border: "2px solid #333", // adaugă o margine
    cursor: "pointer",
    marginRight:"3%"
  }}
/>

                    <span>
                      {translations.gdprPrefix}
                      <Link className="text-purple-1" href="/politica-de-confidentialitate">
                        {translations.gdprPrivacyLink}
                      </Link>
                      {" și "}
                      <Link className="text-purple-1" href="/politica-cookies">
                        {translations.gdprCookiesLink}
                      </Link>
                      {translations.gdprSuffix}
                    </span>
                  </label>
                </div>

                {/* Butonul de trimitere: dezactivat (gri) dacă nu este bifat checkbox-ul */}
                <button
  type="submit"
  disabled={!gdprConsent}
  style={{
    backgroundColor: !gdprConsent ? "#ccc" : "#28a745",
    color: !gdprConsent ? "#666" : "#fff",
    cursor: !gdprConsent ? "not-allowed" : "pointer",
    border: "none",
    borderRadius: "4px",
    padding: "0.6rem 1rem",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  }}
>
  {
    !gdprConsent
      ? translations.consentButtonDisabled
      : translations.submitButton
  }
</button>

              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
