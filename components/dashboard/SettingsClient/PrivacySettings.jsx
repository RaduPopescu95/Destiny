import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { DotLoader } from "react-spinners";
import AlertBox from "@/components/uiElements/AlertBox";

export default function PrivacySettings({ activeTab, translatedTexts }) {
  const { userData, setUserData } = useAuth();
  // Valorile implicite sunt true, astfel încât lipsa proprietății să fie tratată ca true.
  const [settings, setSettings] = useState({
    showAge: true,
    emailCompatibility: true,
    emailPromotions: true,
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    type: "",
    content: "",
    showAlert: false,
  });

  useEffect(() => {
    if (userData) {
      if (userData.privacySettings) {
        // Dacă proprietatea există, folosim valoarea salvată, iar pentru cele lipsă, setăm true.
        setSettings({
          showAge:
            userData.privacySettings.showAge !== undefined
              ? userData.privacySettings.showAge
              : true,
          emailCompatibility:
            userData.privacySettings.emailCompatibility !== undefined
              ? userData.privacySettings.emailCompatibility
              : true,
          emailPromotions:
            userData.privacySettings.emailPromotions !== undefined
              ? userData.privacySettings.emailPromotions
              : true,
        });
      } else {
        // Dacă nu există deloc setările, le setăm pe toate la true
        setSettings({
          showAge: true,
          emailCompatibility: true,
          emailPromotions: true,
        });
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, "Users", userData.uid);
      await updateDoc(userRef, { privacySettings: settings });
      setUserData((prev) => ({ ...prev, privacySettings: settings }));
      setAlertMessage({
        type: "success",
        // Proprietate de traducere: settingsUpdated
        content:
          translatedTexts?.settingsUpdated ||
          "Setările au fost actualizate cu succes.",
        showAlert: true,
      });
    } catch (error) {
      setAlertMessage({
        type: "danger",
        // Proprietate de traducere: settingsUpdateError
        content:
          error.message ||
          translatedTexts?.settingsUpdateError ||
          "A apărut o eroare la actualizare.",
        showAlert: true,
      });
    }
    setLoading(false);
  };

  return (
    <div className={`tabs__pane -tab-item-4 ${activeTab === 4 ? "is-active" : ""}`}>
      <div className="privacy-settings-container">
        <form onSubmit={handleSubmit} className="privacy-settings-form">
          <h2 className="mb-10">
            {/* Proprietate de traducere: privacySettingsTitle */}
            {translatedTexts?.privacySettingsTitle || "Setări de confidențialitate"}
          </h2>

          <div className="form-group mt-10">
            <label>
              <input
                type="checkbox"
                name="showAge"
                checked={settings.showAge}
                onChange={handleChange}
              />
              {/* Proprietate de traducere: displayAge */}
              {translatedTexts?.displayAge || "Afișare vârstă"}
            </label>
          </div>

          <div className="form-group mt-10">
            <label>
              <input
                type="checkbox"
                name="emailCompatibility"
                checked={settings.emailCompatibility}
                onChange={handleChange}
              />
              {/* Proprietate de traducere: emailCompatibility */}
              {translatedTexts?.emailCompatibility ||
                "Notificări email privind compatibilități"}
            </label>
          </div>

          <div className="form-group mt-10">
            <label>
              <input
                type="checkbox"
                name="emailPromotions"
                checked={settings.emailPromotions}
                onChange={handleChange}
              />
              {/* Proprietate de traducere: emailPromotions */}
              {translatedTexts?.emailPromotions ||
                "Notificări email privind promoții"}
            </label>
          </div>

          <div className="form-group mt-10">
            {loading ? (
              <div className="spinner-border text-primary" role="status">
                <DotLoader color="#c13365" size={30} />
              </div>
            ) : (
              <button type="submit" className="button -md -purple-1 text-white">
                {/* Proprietate de traducere: saveSettings */}
                {translatedTexts?.saveSettings || "Salvează setările"}
              </button>
            )}
          </div>
        </form>

        <AlertBox
          type={alertMessage.type}
          message={alertMessage.content}
          showAlert={alertMessage.showAlert}
          onClose={() => setAlertMessage({ ...alertMessage, showAlert: false })}
        />
      </div>
    </div>
  );
}
