"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FaCheckCircle, FaCheckDouble } from "react-icons/fa";

/**
 * Sidebar care afișează lista de useri compatibili și starea ultimului mesaj,
 * plus un indicator "Typing..." dacă utilizatorul tastează.
 */
export default function SidebarChat({
  compatibleUsers,
  selectedUser,
  setSelectedUser,
  userData,
  typingStates,
}) {
  return (
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
                lastMsgSnippet = lastMsg.content.substring(0, 30) + "...";
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

            // Indicator "Typing..." dacă userul tastează (typingStates = { [userId]: bool })
            const isUserTyping = typingStates[user.id] === true;

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
                        <span style={{ marginLeft: 10, color: "#1d5f8a" }}>
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
  );
}
