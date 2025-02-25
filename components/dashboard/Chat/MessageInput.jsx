"use client";
import React from "react";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyDown,
  handleTyping,
}) {
  return (
    <div className="py-25 px-40 border-top-light">
      <div className="row y-gap-10 justify-between">
        <div className="col-lg-7">
          <textarea
            required
            className="-dark-bg-dark-1 py-20 w-1/1"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a Message"
            onKeyDown={(e) => {
              handleKeyDown(e);
              handleTyping(); // Apelează funcția de tastare
            }}
            style={{
              resize: "none", // Dezactivează redimensionarea manuală
              maxHeight: "100px", // Înălțime fixă
              width: "100%", // Lățime fixă sau proporțională
              boxSizing: "border-box", // Include padding în dimensiuni
              border: "1px solid #ccc", // Linie de contur
              padding: "10px", // Spațiu interior
              overflowY: "auto", // Scroll vertical dacă textul depășește înălțimea
            }}
          />
        </div>
        <div className="col-auto">
          <button
            onClick={handleSendMessage}
            className="button -md -purple-1 text-white shrink-0"
          >
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}
