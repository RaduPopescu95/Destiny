import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { DotLoader } from "react-spinners";
import AlertBox from "@/components/uiElements/AlertBox";

export default function PrivacySettings({ activeTab, translatedTexts }) {
  const { userData, setUserData } = useAuth();
  // Valorile implicite sunt true
  const [settings, setSettings] = useState({
    showAge: true,
    emailCompatibility: true,
    emailPromotions: true,
    emailChatNotifications: true, // noua proprietate
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
          emailChatNotifications:
            userData.privacySettings.emailChatNotifications !== undefined
              ? userData.privacySettings.emailChatNotifications
              : true,
        });
      } else {
        setSettings({
          showAge: true,
          emailCompatibility: true,
          emailPromotions: true,
          emailChatNotifications: true,
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
        content:
          translatedTexts?.settingsUpdated ||
          "Setările au fost actualizate cu succes.",
        showAlert: true,
      });
    } catch (error) {
      setAlertMessage({
        type: "danger",
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
              {translatedTexts?.emailCompatibility || "Notificări email privind compatibilități"}
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
              {translatedTexts?.emailPromotions || "Notificări email privind promoții"}
            </label>
          </div>

          {/* Noua opțiune pentru notificări email privind mesaje noi */}
          <div className="form-group mt-10">
            <label>
              <input
                type="checkbox"
                name="emailChatNotifications"
                checked={settings.emailChatNotifications}
                onChange={handleChange}
              />
              {translatedTexts?.emailChatNotifications ||
                "Notificări email pentru mesaje noi"}
            </label>
          </div>

          <div className="form-group mt-10">
            {loading ? (
              <div className="spinner-border text-primary" role="status">
                <DotLoader color="#c13365" size={30} />
              </div>
            ) : (
              <button type="submit" className="button -md -purple-1 text-white">
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
