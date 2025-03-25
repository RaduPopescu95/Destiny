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
  updateDoc,
} from "firebase/firestore";
import { query } from "firebase/database";

export function useMessageLogic() {
  const { userData } = useAuth();
  const router = useRouter();

  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserOnline, setSelectedUserOnline] = useState(false);

  // Dictionar în care stocăm typing pt. fiecare user compatibil
  const [typingStates, setTypingStates] = useState({});

  // Pentru demo, forțăm isSubscribed = true
  let isSubscribed = true;
  let allowedConversation = true;

  // Referință pentru containerul de mesaje
  const messagesEndRef = useRef(null);

  // Scroll la ultimul mesaj
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Marcare online/offline
  useEffect(() => {
    if (!userData?.uid) return;
    const userDocRef = doc(db, "Users", userData.uid);

    // La montare → isOnline: true
    setDoc(userDocRef, { isOnline: true }, { merge: true }).catch((err) =>
      console.error("Error setting online status:", err)
    );

    // La demontare → isOnline: false
    return () => {
      setDoc(userDocRef, { isOnline: false }, { merge: true }).catch((err) =>
        console.error("Error resetting online status:", err)
      );
    };
  }, [userData?.uid]);

  // Fetch lista userilor compatibili + ultimul mesaj
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
            if (!userSnapshot.exists()) return null;

            const userInfo = { id: userSnapshot.id, ...userSnapshot.data() };

            // Construieste chatPath
            const chatPath = [userId, userData.uid].sort().join("-");
            const messagesQuery = query(
              collection(db, "Chats", chatPath, "Messages")
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            if (messagesSnapshot.empty) {
              return {
                ...userInfo,
                mainImage: userInfo?.images?.[0]?.fileUri || null,
                lastMessage: null,
                lastMessageTimestamp: null,
              };
            }

            // Gaseste ultimul mesaj (cel mai recent)
            const allMsgs = messagesSnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

            const lastMessage = allMsgs[0];

            return {
              ...userInfo,
              mainImage: userInfo?.images?.[0]?.fileUri || null,
              lastMessage: lastMessage, // păstrăm tot obiectul
              lastMessageTimestamp: lastMessage?.timestamp?.toDate() || null,
            };
          })
        );
        const uniqueUsersWithLastMessage = usersWithLastMessage
        .filter(Boolean)
        .filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
      
        // Sortează după timestamp
        const sortedUsers = uniqueUsersWithLastMessage
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
    };

    fetchCompatibleUsers();
  }, [userData?.uid]);

  // Abonare la "Typing" pentru fiecare user din listă - să putem afișa "Typing..." în sidebar
  useEffect(() => {
    if (!compatibleUsers || !userData?.uid) return;

    // Dezabonăm la unmount
    const unsubscribes = [];

    compatibleUsers.forEach((u) => {
      if (!u?.id) return;

      // Cheia de chat user->me (ordinea poate varia, dar important e să fie la fel ca la setTyping)
      const chatPath = `${u.id}-${userData.uid}`;
      const typingRef = doc(db, "Chats", chatPath, "Typing", "State");
      
      const unsubscribe = onSnapshot(typingRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          // Este "true" doar dacă "typingUid" nu este al meu
          const isTypingRemote = data.isTyping && data.typingUid !== userData.uid;
          setTypingStates((prev) => ({ ...prev, [u.id]: isTypingRemote }));
        } else {
          setTypingStates((prev) => ({ ...prev, [u.id]: false }));
        }
      });
      

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [compatibleUsers, userData?.uid]);

  // Ascultă mesaje în timp real cu userul selectat
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
    if (!isSubscribed && allowedConversation && selectedUser.id !== allowedConversation.id) {
      router.push("/subscriptions");
      return;
    }
    const chatPath = [userData.uid, selectedUser.id].sort().join("-");
    const chatRef = collection(db, "Chats", chatPath, "Messages");
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [selectedUser, userData?.uid]);

  // Scroll la ultimul mesaj când `messages` se schimbă
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Trimite mesaj
// Trimite mesaj
const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedUser) return;
  if (!isSubscribed && allowedConversation && selectedUser.id !== allowedConversation.id) {
    router.push("/subscriptions");
    return;
  }

  // Datele mesajului
  const messageData = {
    senderId: userData.uid,
    receiverId: selectedUser.id,
    content: newMessage,
    timestamp: new Date(),
    status: "sent",
  };

  // Construim cele două chatId-uri
  const chatId1 = `${userData.uid}-${selectedUser.id}`;
  const chatId2 = `${selectedUser.id}-${userData.uid}`;

  try {
    // 1. Asigură-te că documentul părinte (Chats/chatId1) are câmpurile "exists" și "documentId"
    const chatDocRef1 = doc(db, "Chats", chatId1);
    await setDoc(
      chatDocRef1,
      {
        exists: true,                 // sau orice câmp vrei 
        documentId: chatId1,         // stochezi ID-ul explicit 
        createdAt: new Date(),       // exemplu de câmp suplimentar
      },
      { merge: true }
    );

    // 2. Asigură-te că documentul părinte (Chats/chatId2) are câmpurile "exists" și "documentId"
    const chatDocRef2 = doc(db, "Chats", chatId2);
    await setDoc(
      chatDocRef2,
      {
        exists: true,
        documentId: chatId2,
        createdAt: new Date(),
      },
      { merge: true }
    );

    // 3. Adăugăm mesajul în subcolecția "Messages" la ambele conversații
    await addDoc(collection(db, "Chats", chatId1, "Messages"), messageData);
    await addDoc(collection(db, "Chats", chatId2, "Messages"), messageData);

    // Resetăm câmpul de mesaj
    setNewMessage("");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};


  // Enter trimite mesaj (dacă nu e SHIFT+ENTER)
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

  // Ascultă typing doar pentru userul selectat
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
    const typingRef = doc(
      db,
      "Chats",
      `${userData.uid}-${selectedUser.id}`,
      "Typing",
      "State"
    );
    const unsubscribe = onSnapshot(typingRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setIsTyping(docSnapshot.data()?.isTyping || false);
      } else {
        setIsTyping(false);
      }
    });
    return () => unsubscribe();
  }, [selectedUser, userData?.uid]);

  // Marcare "isTyping: true" pentru doc-ul invers (selectedUser.id - userData.uid)
// Marcare "isTyping: true" + cine tastează
const handleTyping = async () => {
    if (!selectedUser || !userData?.uid) return;
    const typingRef = doc(
      db,
      "Chats",
      `${selectedUser.id}-${userData.uid}`,
      "Typing",
      "State"
    );
    try {
      await setDoc(
        typingRef,
        {
          isTyping: true,
          typingUid: userData.uid, // adăugăm cine tastează
        },
        { merge: true }
      );
  
      setTimeout(async () => {
        await setDoc(
          typingRef,
          {
            isTyping: false,
            typingUid: null,
          },
          { merge: true }
        );
      }, 3000);
    } catch (error) {
      console.error("Error in handleTyping:", error);
    }
  };
  
  // Ascultă online status pentru userul selectat
  useEffect(() => {
    if (!selectedUser) return;
    const userDocRef = doc(db, "Users", selectedUser.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setSelectedUserOnline(docSnapshot.data()?.isOnline || false);
      }
    });
    return () => unsubscribe();
  }, [selectedUser]);

  // Marcare "seen" pentru mesajele primite de la userul selectat
  useEffect(() => {
    if (!selectedUser || !userData?.uid) return;
    messages.forEach((msg) => {
      if (msg.senderId !== userData.uid && msg.status !== "seen") {
        const chatPath1 = `${userData.uid}-${selectedUser.id}`;
        const chatPath2 = `${selectedUser.id}-${userData.uid}`;
        const msgRef1 = doc(db, "Chats", chatPath1, "Messages", msg.id);
        const msgRef2 = doc(db, "Chats", chatPath2, "Messages", msg.id);

        updateDoc(msgRef1, { status: "seen" }).catch((err) =>
          console.error("Error updating message status in chatPath1:", err)
        );
        updateDoc(msgRef2, { status: "seen" }).catch((err) =>
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
    handleSendMessage,
    handleKeyDown,
    isTyping,
    handleTyping,
    isSubscribed,
    allowedConversation,
    userData,
    selectedUserOnline,
    typingStates, // pentru sidebar
    messagesEndRef,
  };
}
