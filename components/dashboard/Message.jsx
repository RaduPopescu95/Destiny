"use client";
import React from "react";
import { useMessageLogic } from "@/hooks/useMessageLogic";
import SidebarChat from "./Chat/SidebarChat";
import ConversationChat from "./Chat/ConversationChat";


/**
 * Componenta principală "Message" care folosește useMessageLogic,
 * și împarte UI-ul în Sidebar și Conversation.
 */
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

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row y-gap-30">
          {/* Coloană stânga: SIDEBAR */}
          <div className="col-xl-4">
            <SidebarChat
              compatibleUsers={compatibleUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              userData={userData}
              typingStates={typingStates}
            />
          </div>

          {/* Coloană dreapta: CONVERSAȚIA CURENTĂ */}
          <div className="col-xl-8">
            <ConversationChat
              selectedUser={selectedUser}
              userData={userData}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              handleKeyDown={handleKeyDown}
              isTyping={isTyping}
              handleTyping={handleTyping}
              selectedUserOnline={selectedUserOnline}
              messagesEndRef={messagesEndRef}
              isSubscribed={isSubscribed}
              allowedConversation={allowedConversation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
