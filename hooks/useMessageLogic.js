"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { query } from "firebase/database";

export function useMessageLogic() {
  const { userData } = useAuth();
  const router = useRouter();

  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  let isSubscribed =
    userData?.subscriptionActive ||
    userData?.subscriptionStatus === "canceledUntilEnd";
  // For demo purposes, forțează true:
  isSubscribed = true;
  let allowedConversation =
    !isSubscribed && compatibleUsers.length > 0 ? compatibleUsers[0] : null;
  allowedConversation = true;

  // Referință pentru containerul de mesaje
  const messagesEndRef = useRef(null);

  // Funcție pentru scroll la ultimul mesaj
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch compatible users and last message
  useEffect(() => {
    const fetchCompatibleUsers = async () => {
      if (!userData?.uid) return;
      try {
        const compatibilitatiRef = collection(
          db,
          "Users",
          userData.uid,
          "Compatibilitati"
        );
        const compatibilitatiSnapshot = await getDocs(compatibilitatiRef);
        const compatibleUserIds = compatibilitatiSnapshot.docs.map(
          (doc) => doc.data().compatibleUserId
        );

        const usersWithLastMessage = await Promise.all(
          compatibleUserIds.map(async (userId) => {
            if (userId === userData.uid) return null;

            const userDocRef = doc(db, "Users", userId);
            const userSnapshot = await getDoc(userDocRef);
            const userInfo = { id: userSnapshot.id, ...userSnapshot.data() };

            // Build chatPath by sorting UIDs
            const chatPath = [userId, userData.uid].sort().join("-");
            const messagesQuery = query(
              collection(db, "Chats", chatPath, "Messages")
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            const lastMessage = messagesSnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate())[0];
            const mainImage = userInfo?.images?.[0]?.fileUri;

            if (messagesSnapshot.empty) {
              console.log(`No messages found for chat: ${chatPath}`);
              return { ...userInfo, mainImage, lastMessageTimestamp: null };
            }
            console.log("main image.....", mainImage);
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
        console.log("sortedUsers...", sortedUsers);
        setCompatibleUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching compatible users:", error);
      }
    };

    fetchCompatibleUsers();
  }, [userData?.uid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time listener for messages between user and selectedUser
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
    if (!isSubscribed && allowedConversation && selectedUser.id !== allowedConversation.id) {
      router.push("/subscriptions");
      return;
    }
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

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    if (!isSubscribed && allowedConversation && selectedUser.id !== allowedConversation.id) {
      router.push("/subscriptions");
      return;
    }
    const messageData = {
      senderId: userData.uid,
      receiverId: selectedUser.id,
      content: newMessage,
      timestamp: new Date(),
      seen: false,
    };
    await addDoc(
      collection(db, "Chats", `${userData.uid}-${selectedUser.id}`, "Messages"),
      messageData
    );
    await addDoc(
      collection(db, "Chats", `${selectedUser.id}-${userData.uid}`, "Messages"),
      messageData
    );
    setNewMessage("");
  };

  // Handle sending message on Enter key press
  const handleKeyDown = (e) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (!isMobile) {
      if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
        setNewMessage((prev) => prev + "\n");
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  // Listen for typing state
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
    const typingRef = doc(
      db,
      "Chats",
      `${userData.uid}-${selectedUser.id}`,
      "Typing",
      "State"
    );
    console.log("Listening to typing updates for:", typingRef.path);
    const unsubscribe = onSnapshot(typingRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        console.log("Typing document data:", docSnapshot.data());
        setIsTyping(docSnapshot.data()?.isTyping || false);
      } else {
        console.log("Typing document does not exist at:", typingRef.path);
      }
    });
    return () => unsubscribe();
  }, [selectedUser, userData?.uid]);

  // Handle typing: set typing state to true, then reset after 3 sec.
  const handleTyping = async () => {
    if (!selectedUser || !userData?.uid) return;
    const typingRef = doc(
      db,
      "Chats",
      `${selectedUser.id}-${userData.uid}`, // Ensure correct order
      "Typing",
      "State"
    );
    try {
      console.log("Setting typing state to true at:", typingRef.path);
      await setDoc(typingRef, { isTyping: true }, { merge: true });
      console.log("Typing state set to true successfully");
      setTimeout(async () => {
        console.log("Resetting typing state to false at:", typingRef.path);
        await setDoc(typingRef, { isTyping: false }, { merge: true });
        console.log("Typing state reset to false successfully");
      }, 3000);
    } catch (error) {
      console.error("Error in handleTyping:", error);
    }
  };

  return {
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
    userData, // adăugăm userData aici
  };
}
