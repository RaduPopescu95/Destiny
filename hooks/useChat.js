"use client";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function useChat(userData, selectedUser) {
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  // Poți extinde cu logica pentru unseenMessages dacă e nevoie
  const [unseenMessages, setUnseenMessages] = useState({});

  useEffect(() => {
    async function fetchCompatibleUsers() {
      if (!userData?.uid) return;
      try {
        const compatRef = collection(db, "Users", userData.uid, "Compatibilitati");
        const compatSnapshot = await getDocs(compatRef);
        const compatibleUserIds = compatSnapshot.docs.map((doc) => doc.data().compatibleUserId);
        const usersWithLastMessage = await Promise.all(
          compatibleUserIds.map(async (userId) => {
            if (userId === userData.uid) return null;
            const userDocRef = doc(db, "Users", userId);
            const userSnapshot = await getDoc(userDocRef);
            const userInfo = { id: userSnapshot.id, ...userSnapshot.data() };
            const chatPath = [userId, userData.uid].sort().join("-");
            const messagesQuery = collection(db, "Chats", chatPath, "Messages");
            const messagesSnapshot = await getDocs(messagesQuery);
            const lastMessage = messagesSnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())[0];
            const mainImage = userInfo?.images?.[0]?.fileUri;
            return {
              ...userInfo,
              mainImage,
              lastMessageTimestamp: lastMessage?.timestamp?.toDate() || null,
            };
          })
        );
        const sortedUsers = usersWithLastMessage
          .filter(Boolean)
          .sort((a, b) => {
            if (a.lastMessageTimestamp && b.lastMessageTimestamp)
              return b.lastMessageTimestamp - a.lastMessageTimestamp;
            if (a.lastMessageTimestamp) return -1;
            if (b.lastMessageTimestamp) return 1;
            return 0;
          });
        setCompatibleUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching compatible users:", error);
      }
    }
    fetchCompatibleUsers();
  }, [userData?.uid]);

  useEffect(() => {
    if (!selectedUser) return;
    const chatPath = `${userData.uid}-${selectedUser.id}`;
    const chatRef = collection(db, "Chats", chatPath, "Messages");
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [selectedUser, userData?.uid]);

  return { compatibleUsers, messages, unseenMessages, setUnseenMessages };
}
