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
  updateDoc, // import pentru actualizarea documentelor
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
  const [selectedUserOnline, setSelectedUserOnline] = useState(false);

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

  // ACTUALIZEAZĂ ONLINE SAU OFFLINE
  useEffect(() => {
    if (!userData?.uid) return;
    const userDocRef = doc(db, "Users", userData.uid);
    // La montare, setează online = true
    setDoc(userDocRef, { isOnline: true }, { merge: true })
      .catch((err) => console.error("Error setting online status:", err));
    
    // La demontare, setează online = false
    return () => {
      setDoc(userDocRef, { isOnline: false }, { merge: true })
        .catch((err) => console.error("Error resetting online status:", err));
    };
  }, [userData?.uid]);
  
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
      status: "sent", // Status inițial
    };
    // Adăugăm mesajul în ambele locații
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

  // Listen for online status of selectedUser
  useEffect(() => {
    if (!selectedUser) return;
    const userDocRef = doc(db, "Users", selectedUser.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("User document data:", data); // Debug: afișează toate datele din document
        const online = data.isOnline;
        console.log("Online status received:", online); // Debug: afișează statusul online
        setSelectedUserOnline(online || false);
      } else {
        console.log("Documentul pentru utilizatorul selectat nu există.");
      }
    });
    return () => unsubscribe();
  }, [selectedUser]);

  // Actualizează statusul mesajelor la "seen" pentru toate mesajele (inclusiv cele trimise)
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
  
    messages.forEach((msg) => {
      // Marcam ca "seen" doar mesajele primite de la alt utilizator (nu ale tale)
      if (msg.senderId !== userData.uid && msg.status !== "seen") {
        const chatPath1 = `${userData.uid}-${selectedUser.id}`;
        const chatPath2 = `${selectedUser.id}-${userData.uid}`;
        const msgRef1 = doc(db, "Chats", chatPath1, "Messages", msg.id);
        const msgRef2 = doc(db, "Chats", chatPath2, "Messages", msg.id);
  
        updateDoc(msgRef1, { status: "seen" })
          .then(() =>
            console.log("Message status updated to seen in chatPath1")
          )
          .catch((err) =>
            console.error("Error updating message status in chatPath1:", err)
          );
  
        updateDoc(msgRef2, { status: "seen" })
          .then(() =>
            console.log("Message status updated to seen in chatPath2")
          )
          .catch((err) =>
            console.error("Error updating message status in chatPath2:", err)
          );
      }
    });
  }, [messages, selectedUser, userData?.uid]);
  
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
    selectedUserOnline, // online status indicator
  };
}
