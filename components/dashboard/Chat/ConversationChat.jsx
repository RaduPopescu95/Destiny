"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FaCheckCircle, FaCheckDouble } from "react-icons/fa";
import TypingAnimation from "../TypingAnimation";
import EmojiPickerDesktop from "./EmojiPickerDesktop"; // Importăm componenta emoji

/**
 * Componenta care afișează conversația curentă și permite trimiterea de mesaje.
 */
export default function ConversationChat({
  selectedUser,
  userData,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyDown,
  isTyping,
  handleTyping,
  selectedUserOnline,
  messagesEndRef,
  isSubscribed,
  allowedConversation,
  handleDeleteMessage,
  handleEditMessage
}) {
  // Stare pentru afișarea selectorului de emoji-uri
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  // Funcția care adaugă emoji-ul selectat la mesajul curent
  const [editingMessage, setEditingMessage] = useState(null);
  const onEmojiClick = (emojiData, event) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

   // Funcție pentru a verifica poziția de scroll
   const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Dacă nu e aproape de bottom (ex. 50px de diferență), afișează butonul
    if (scrollHeight - scrollTop - clientHeight > 50) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

   // Funcție pentru a scrolla la bottom
   const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  // Funcția care salvează editarea mesajului
  const handleSaveEdit = async () => {
    if (!editingMessage) return;
    // Apelăm funcția de editare din hook cu noul conținut
    await handleEditMessage({ ...editingMessage, content: newMessage });
    // Resetăm starea de editare și câmpul de mesaj
    setEditingMessage(null);
    setNewMessage("");
  };

  // La dublu click pe mesajul tău, treci în modul de editare
  const handleDoubleClick = (msg) => {
    if (msg.senderId === userData?.uid) {
      setEditingMessage(msg);
      setNewMessage(msg.content);
    }
  };

  return (
    <div className="rounded-16 bg-white shadow-4 h-100" style={{ position: "relative" }}>
      {/* Header - user selectat */}
      {selectedUser ? (
        <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
          <div className="d-flex items-center">
            {/* Link în jurul imaginii pentru navigare */}
            <Link href={`/client-compatibil?uid=${selectedUser?.uid}`}>
              <div
                className="shrink-0"
                style={{ cursor: "pointer" }}
                title="Vezi detalii client"
              >
                {selectedUser?.mainImage ? (
                  <Image
                    width={50}
                    height={50}
                    src={selectedUser?.mainImage}
                    alt="image"
                    className="size-50"
                    style={{
                      borderRadius: "25%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    size="2x"
                    className="text-muted"
                    style={{
                      width: "50px",
                      height: "50px",
                    }}
                  />
                )}
              </div>
            </Link>
            <div className="ml-10">
              <div className="lh-11 fw-500 text-dark-1">
                {selectedUser?.username}
                {selectedUserOnline ? (
                  <span className="ml-2 inline-block text-green-1" title="Online">
                    (Online)
                  </span>
                ) : (
                  <span className="ml-2 inline-block text-dark-1" title="Offline">
                    (Offline)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
          <div>Selectează un user din listă</div>
        </div>
      )}

      {/* Lista de mesaje */}
      <div
        className="messages-container py-40 px-40"
        style={{ height: "400px", overflowY: "auto", position: "relative" }}
      >
        <div className="row y-gap-20">
          {messages.map((msg) => (
            <div
              key={msg?.id}
              className={`col-xl-7 col-lg-10 ${
                msg?.senderId === userData?.uid
                  ? "offset-xl-5 offset-lg-2 text-right"
                  : ""
              }`}
              onDoubleClick={() => handleDoubleClick(msg)}
                     onContextMenu={(e) => {
                e.preventDefault(); // Previne meniul contextual implicit
                if (msg.senderId === userData?.uid) {
                  handleDeleteMessage(msg);
                }
              }}
            >
              <div
                className={`d-flex items-center ${
                  msg?.senderId === userData?.uid ? "justify-end" : ""
                }`}
              >
                {/* Dacă mesajul e trimis de celălalt, îi afișăm avatarul cu Link */}
                {msg?.senderId !== userData?.uid && (
                  <Link href={`/client-compatibil?uid=${selectedUser?.uid}`}>
                    <div className="shrink-0" style={{ cursor: "pointer" }}>
                      {selectedUser?.mainImage ? (
                        <Image
                          width={50}
                          height={50}
                          src={selectedUser?.mainImage}
                          alt="Avatar"
                          className="size-50"
                          style={{
                            borderRadius: "25%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          size="2x"
                          className="text-muted"
                          style={{ width: "50px", height: "50px" }}
                        />
                      )}
                    </div>
                  </Link>
                )}

                {/* Afișăm "You" sau "username" + iconița de "seen/sent" dacă e mesaj de la tine */}
                <div className="lh-11 fw-500 text-dark-1 ml-10">
                  {msg?.senderId === userData?.uid ? "You" : selectedUser?.username}
                </div>

                {/* Timpul când a fost trimis mesajul */}
                <div className="text-14 lh-11 ml-10">
                  {msg?.timestamp instanceof Date
                    ? `${msg.timestamp.toLocaleDateString()} ${msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : msg?.timestamp?.toDate()?.toLocaleDateString() +
                      " " +
                      msg?.timestamp
                        ?.toDate()
                        ?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                </div>
                {msg?.senderId === userData?.uid && (
                  msg?.status === "seen" ? (
                    <FaCheckDouble
                      title="Seen"
                      style={{ color: "blue", marginLeft: 8 }}
                    />
                  ) : (
                    <FaCheckCircle
                      title="Sent"
                      style={{ color: "gray", marginLeft: 8 }}
                    />
                  )
                )}
              </div>

              {/* Conținutul mesajului */}
              <div className="d-inline-block mt-15">
                <div
                  className={`py-20 px-30 rounded-8 message-content ${
                    msg?.senderId === userData?.uid
                      ? "bg-light-7 text-purple-1 text-right"
                      : "bg-light-3"
                  }`}
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                 {msg?.content}
                  {msg?.edited && (
                    <span style={{ fontStyle: "italic", fontSize: "0.8em", marginLeft: "8px" }}>
                      (editat)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Indicator "Typing..." (pentru userul selectat) */}
          {isTyping && (
            <div
              className="d-flex align-items-center mt-10"
              style={{ marginLeft: "10px", gap: "10px" }}
            >
              {selectedUser?.mainImage ? (
                <Image
                  src={selectedUser?.mainImage}
                  alt="Typing User"
                  width={50}
                  height={50}
                  style={{ borderRadius: "25%", objectFit: "cover" }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUserCircle}
                  size="2x"
                  className="text-muted"
                  style={{ width: "50px", height: "50px" }}
                />
              )}
              <TypingAnimation />
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>
{/* Butonul de scroll, afișat condițional */}
{showScrollButton && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              padding: "10px 15px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#1d5f8a",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Scroll to Bottom
          </button>
        )}
        {/* Overlay dacă nu ești abonat și nu e userul permis */}
        {selectedUser &&
          !isSubscribed &&
          allowedConversation &&
          selectedUser.id !== allowedConversation.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
              Upgrade pentru acces complet
            </div>
          )}
      </div>

      {/* Zona de input pentru compunere mesaj */}
      <div className="py-25 px-40 border-top-light" style={{ position: "relative" }}>
        <div className="row y-gap-10 justify-between">
          <div className="col-lg-7" style={{ position: "relative" }}>
            <textarea
              required
              className="py-20 w-1/1"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a Message"
              onKeyDown={(e) => {
                handleKeyDown(e);
                handleTyping();
              }}
              style={{
                resize: "none",
                maxHeight: "100px",
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #ccc",
                padding: "10px",
                overflowY: "auto",
              }}
            />
            {/* Buton pentru toggle emoji picker */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              style={{
                position: "absolute",
                right: "-20px",
                top: "0px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
              }}
              title="Selectează un emoji"
            >
              😊
            </button>
            {/* Renderizarea selectorului de emoji-uri */}
            {showEmojiPicker && <EmojiPickerDesktop onEmojiClick={onEmojiClick} />}
          </div>
          <div className="col-auto">
          <button
              onClick={editingMessage ? handleSaveEdit : handleSendMessage}
              className="button -md -purple-1 text-white shrink-0"
            >
              {editingMessage ? "Salvează" : "Trimite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
