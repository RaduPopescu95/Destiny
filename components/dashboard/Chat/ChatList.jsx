"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

export default function ChatList({
  users,
  selectedUser,
  onSelectUser,
  unseenMessages,
  isSubscribed,
  allowedConversation,
}) {
  return (
    <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
      <div className="d-flex items-center py-20 px-30 border-bottom-light">
        <h2 className="text-17 lh-1 fw-500">Chats</h2>
      </div>

      <div className="py-30 px-30">
        <div className="y-gap-30">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`d-flex justify-between cursor-pointer ${
                selectedUser?.id === user.id ? "bg-light-5" : ""
              } ${
                !isSubscribed &&
                allowedConversation &&
                user.id !== allowedConversation.id
                  ? "blurred"
                  : ""
              }`}
            >
              <div className="d-flex items-center">
                <div className="shrink-0">
                  {user?.mainImage ? (
                    <Image
                      width={50}
                      height={50}
                      src={user.mainImage}
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
                    {user.username}
                  </div>
                </div>
              </div>

              {unseenMessages[user.id] > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "#FF0000",
                    color: "#FFFFFF",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  {unseenMessages[user.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
