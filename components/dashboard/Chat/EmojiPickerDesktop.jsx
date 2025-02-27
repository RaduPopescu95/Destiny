"use client";
import React, { useState, useEffect, useRef } from "react";
import Picker from "emoji-picker-react"; // Asigură-te că ai instalat biblioteca: npm install emoji-picker-react

/**
 * Componenta care afișează selectorul de emoji-uri doar pe desktop.
 * Când se face click în afara pickerului, se apelează callback-ul onClose.
 */
const EmojiPickerDesktop = ({ onEmojiClick, onClose }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose && onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isDesktop) return null;

  return (
    <div
      ref={pickerRef}
      style={{
        position: "absolute",
        bottom: "100%",
        right: "20px",
        zIndex: 1000,
      }}
    >
      <Picker onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default EmojiPickerDesktop;
