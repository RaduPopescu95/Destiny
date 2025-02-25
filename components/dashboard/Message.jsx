"use client";
import React from "react";
import FooterNine from "../layout/footers/FooterNine";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import TypingAnimation from "./TypingAnimation";
import { useMessageLogic } from "@/hooks/useMessageLogic";
import { useRouter } from "next/navigation";
// poți folosi orice iconițe vrei pentru "sent" / "seen"
import { FaCheckCircle, FaCheckDouble } from "react-icons/fa";

export default function Message() {
  const {
    compatibleUsers,
    selectedUser,
    setSelectedUser,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    isTyping,
    handleTyping,
    isSubscribed,
    allowedConversation,
    userData,
    selectedUserOnline,
    typingStates,
    messagesEndRef,
  } = useMessageLogic();

  const router = useRouter();

  // Când apeși pe imaginea din header, intri la profilul userului
  const handleIconClick = () => {
    if (selectedUser && userData) {
      const chatId = [selectedUser.id, userData.uid].sort().join("-");
      router.push(`/client-compatibil?uid=${selectedUser.id}&cid=${chatId}`);
    }
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row y-gap-30">
          {/* SIDEBAR */}
          <div className="col-xl-4">
            <div className="rounded-16 bg-white shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">Chats</h2>
              </div>
              <div className="py-30 px-30">
                <div className="y-gap-30">
                  {compatibleUsers.map((user) => {
                    // Ultimul mesaj
                    const lastMsg = user.lastMessage;
                    // Prescurtare la 30 de caractere
                    let lastMsgSnippet = "";
                    if (lastMsg?.content) {
                      if (lastMsg.content.length > 30) {
                        lastMsgSnippet =
                          lastMsg.content.substring(0, 30) + "...";
                      } else {
                        lastMsgSnippet = lastMsg.content;
                      }
                    }

                    // Afișare icon "seen" / "sent" doar dacă ultimul mesaj e al meu
                    let lastMsgIcon = null;
                    if (lastMsg && lastMsg.senderId === userData?.uid) {
                      if (lastMsg.status === "seen") {
                        lastMsgIcon = (
                          <FaCheckDouble
                            title="Seen"
                            style={{ color: "blue", marginLeft: 8 }}
                          />
                        );
                      } else {
                        lastMsgIcon = (
                          <FaCheckCircle
                            title="Sent"
                            style={{ color: "gray", marginLeft: 8 }}
                          />
                        );
                      }
                    }

                    // Indicator "Typing..." dacă userul tastează
                    const isUserTyping = typingStates[user.id]; // true/false
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`d-flex flex-column w-100 cursor-pointer py-10 px-10 rounded-8 ${
                          selectedUser?.id === user.id ? "bg-light-5" : ""
                        }`}
                      >
                        <div className="d-flex items-center">
                          {/* Avatar */}
                          {user?.mainImage ? (
                            <Image
                              width={50}
                              height={50}
                              src={user.mainImage}
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
                          <div className="ml-10">
                            <div className="lh-11 fw-500 text-dark-1">
                              {user.username}
                            </div>

                            {/* Sub rând: ultimul mesaj & indicator typing */}
                            <div className="text-14 text-dark-1 d-flex items-center">
                              {lastMsgSnippet ? lastMsgSnippet : "No messages yet"}
                              {lastMsgIcon}
                              {isUserTyping && (
                                <span
                                  style={{ marginLeft: 10, color: "#1d5f8a" }}
                                >
                                  Typing...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CONVERSAȚIA CURENTĂ */}
          <div className="col-xl-8">
            <div className="rounded-16 bg-white shadow-4 h-100">
              {selectedUser ? (
                <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
                  <div className="d-flex items-center">
                    <div
                      className="shrink-0"
                      onClick={handleIconClick}
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

              {/* Zona de mesaje */}
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
  >
    <div
      className={`d-flex items-center ${
        msg?.senderId === userData?.uid ? "justify-end" : ""
      }`}
    >
      {/* Dacă mesajul e trimis de celălalt, îi afișăm avatarul */}
      {msg?.senderId !== userData?.uid && (
        <div className="shrink-0">
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
      )}

      {/* Aici afișăm "You" sau "username" + iconița de "seen/sent" dacă e mesaj de la tine */}
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
              {/* Dacă TU ești expeditorul, afișăm iconița seen/sent */}
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

    {/* Conținutul mesajului (textul propriu-zis) */}
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
      </div>
    </div>
  </div>
))}


                  {/* Indicator "Typing..." în zona de mesaje (pentru userul selectat) */}
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
              <div className="py-25 px-40 border-top-light">
                <div className="row y-gap-10 justify-between">
                  <div className="col-lg-7">
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
            </div>
          </div>
        </div>
      </div>

      {/* <FooterNine /> */}
    </div>
  );
}
