"use client";
import React from "react";
import FooterNine from "../layout/footers/FooterNine";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import TypingAnimation from "./TypingAnimation";
import { useMessageLogic } from "@/hooks/useMessageLogic";
import { useRouter } from "next/navigation";
import MessageStatus from "./Chat/MessageStatus";

export default function Message() {
  const {
    compatibleUsers,
    selectedUser,
    setSelectedUser,
    messages,
    newMessage,
    setNewMessage,
    unseenMessages,
    messagesEndRef,
    handleSendMessage,
    handleKeyDown,
    isTyping,
    handleTyping,
    isSubscribed,
    allowedConversation,
    userData,
    selectedUserOnline,
  } = useMessageLogic();

  const router = useRouter();

  // Handler pentru click pe iconiță
  const handleIconClick = () => {
    if (selectedUser && userData) {
      const chatId = [selectedUser.id, userData.uid].sort().join("-");
      router.push(`/client-compatibil?uid=${selectedUser.id}&cid=${chatId}`);
    }
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        {/* <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Messages</h1>
          </div>
        </div> */}

        <div className="row y-gap-30">
          <div className="col-xl-4">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">Chats</h2>
              </div>

              <div className="py-30 px-30">
                <div className="y-gap-30">
                  {compatibleUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
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
          </div>

          <div className="col-xl-8">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              {selectedUser ? (
                <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
                  <div className="d-flex items-center">
                    {/* Iconița devine clickabilă */}
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
    {selectedUser ? selectedUser.username : "Select a user"}
    {selectedUserOnline ? (
      <span className="ml-2 inline-block text-green-1" title="Online">
       {" "}(Online)
      </span>
    ) : (
      <span className="ml-2 inline-block text-dark-1" title="Offline">
        {" "}(Offline)
      </span>
    )}
  </div>
  {/* <div className="text-14 lh-11 mt-5">Active</div> */}
</div>

                  </div>
                  {/* <a
                    href="#"
                    className="text-14 lh-11 fw-500 text-orange-1 underline"
                  >
                    Delete Conversation
                  </a> */}
                </div>
              ) : (
                <div className="d-flex items-center justify-between py-20 px-30 border-bottom-light">
                  <div className="d-flex items-center">
                    <div className="ml-10">
                      <div className="lh-11 fw-500 text-dark-1">
                        {selectedUser ? selectedUser.username : "Select a user"}
                      </div>
                      {/* <div className="text-14 lh-11 mt-5">Active</div> */}
                    </div>
                  </div>
                </div>
              )}

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
                            {/* {msg?.senderId === userData?.uid && (
                            <MessageStatus status={msg.status} />
                        )} */}
                        <div className="lh-11 fw-500 text-dark-1 ml-10">
                          {msg?.senderId === userData?.uid ? "You" : selectedUser?.username}
                        </div>
                        <div className="text-14 lh-11 ml-10">
                          {msg?.timestamp instanceof Date
                            ? `${msg.timestamp.toLocaleDateString()} ${msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
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

                  <div ref={messagesEndRef}></div>
                </div>

                {selectedUser &&
                  !isSubscribed &&
                  allowedConversation &&
                  selectedUser.id !== allowedConversation.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                      Upgrade pentru acces complet
                    </div>
                  )}
              </div>

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
