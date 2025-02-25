"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { sendMessage } from "@/services/firebaseChatService";
import ChatList from "./ChatList";
import ChatConversation from "./ChatConversation";
import MessageInput from "./MessageInput";

export default function Message() {
  const { userData } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { compatibleUsers, messages, unseenMessages } = useChat(userData, selectedUser);

  // Pentru testare; în funcție de logica ta, aceste variabile pot fi calculate
  const isSubscribed = true;
  const allowedConversation = true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    if (!isSubscribed && allowedConversation && selectedUser.id !== allowedConversation.id) {
      router.push("/subscriptions");
      return;
    }
    await sendMessage(userData, selectedUser, newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
        setNewMessage((prev) => prev + "\n");
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleTyping = async () => {
    if (!selectedUser) return;
    // Implementă logica de "typing" similar cu codul inițial, dacă este necesar
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row y-gap-30">
          <div className="col-xl-4">
            <ChatList
              users={compatibleUsers}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              unseenMessages={unseenMessages}
              isSubscribed={isSubscribed}
              allowedConversation={allowedConversation}
            />
          </div>
          <div className="col-xl-8">
            <ChatConversation
              selectedUser={selectedUser}
              messages={messages}
              messagesEndRef={messagesEndRef}
              userData={userData}
              isTyping={isTyping}
              isSubscribed={isSubscribed}
              allowedConversation={allowedConversation}
            />
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              handleKeyDown={handleKeyDown}
              handleTyping={handleTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
