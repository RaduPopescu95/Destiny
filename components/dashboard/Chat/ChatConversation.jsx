"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import TypingAnimation from "../TypingAnimation";

export default function ChatConversation({
  selectedUser,
  messages,
  messagesEndRef,
  userData,
  isTyping,
  isSubscribed,
  allowedConversation,
}) {
  return (
    <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
      {selectedUser ? (
        <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
          <div className="d-flex items-center">
            <div className="shrink-0">
              {selectedUser?.mainImage ? (
                <Image
                  width={50}
                  height={50}
                  src={selectedUser?.mainImage}
                  alt="image"
                  className="size-50"
                  style={{
                    borderRadius: "25%", // Imaginea rotundă
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
                {selectedUser ? selectedUser.username : "Select a user"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
          <div className="d-flex items-center">
            <div className="ml-10">
              <div className="lh-11 fw-500 text-dark-1">
                {selectedUser ? selectedUser.username : "Select a user"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Container with fixed height and scroll for messages */}
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
                          borderRadius: "25%", // Imaginea rotundă
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
                )}
                <div className="lh-11 fw-500 text-dark-1 ml-10">
                  {msg?.senderId === userData?.uid
                    ? "You"
                    : selectedUser?.username}
                </div>
                <div className="text-14 lh-11 ml-10">
                  {msg?.timestamp instanceof Date
                    ? `${msg.timestamp.toLocaleDateString()} ${msg.timestamp.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}`
                    : msg?.timestamp?.toDate()?.toLocaleDateString() +
                      " " +
                      msg?.timestamp?.toDate()?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </div>
              </div>
              <div className="d-inline-block mt-15">
                <div
                  className={`py-20 px-30 rounded-8 message-content ${
                    msg?.senderId === userData?.uid
                      ? "bg-light-7 -dark-bg-dark-2 text-purple-1 text-right"
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

          {/* Secțiune "is typing" */}
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
              <div>
                <TypingAnimation />
              </div>
            </div>
          )}

          {/* Div pentru scroll automat */}
          <div ref={messagesEndRef}></div>

          {/* Overlay pentru conversație nepermisă (non-abonat) */}
          {selectedUser &&
            !isSubscribed &&
            allowedConversation &&
            selectedUser.id !== allowedConversation.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                Upgrade pentru acces complet
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
