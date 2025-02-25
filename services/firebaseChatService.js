"use client";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function sendMessage(userData, selectedUser, newMessage) {
  if (!newMessage.trim() || !selectedUser) return;
  const messageData = {
    senderId: userData.uid,
    receiverId: selectedUser.id,
    content: newMessage,
    timestamp: new Date(),
    seen: false,
    status: "sent",
  };
  const chatPath1 = `${userData.uid}-${selectedUser.id}`;
  const chatPath2 = `${selectedUser.id}-${userData.uid}`;
  try {
    await addDoc(collection(db, "Chats", chatPath1, "Messages"), messageData);
    await addDoc(collection(db, "Chats", chatPath2, "Messages"), messageData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
