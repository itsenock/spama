import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  setDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Chat, Message, User } from "../types";
import * as Crypto from "expo-crypto";

export class ChatService {
  // Create or get individual chat
  static async createOrGetIndividualChat(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    try {
      // Create consistent chat ID
      const participants = [currentUserId, otherUserId].sort();
      const chatId = `${participants[0]}_${participants[1]}`;

      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Create new chat
        const chatData: Partial<Chat> = {
          id: chatId,
          type: "individual",
          participants,
          unreadCount: {
            [currentUserId]: 0,
            [otherUserId]: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(chatRef, {
          ...chatData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return chatId;
    } catch (error) {
      console.error("Create/get chat error:", error);
      throw error;
    }
  }

  // Create group chat
  static async createGroupChat(
    currentUserId: string,
    participants: string[],
    name: string,
    description?: string
  ): Promise<string> {
    try {
      const chatRef = doc(collection(db, "chats"));
      const chatId = chatRef.id;

      const unreadCount: { [key: string]: number } = {};
      participants.forEach((userId) => {
        unreadCount[userId] = 0;
      });

      const chatData: Partial<Chat> = {
        id: chatId,
        type: "group",
        name,
        description,
        participants,
        admins: [currentUserId],
        createdBy: currentUserId,
        unreadCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(chatRef, {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return chatId;
    } catch (error) {
      console.error("Create group chat error:", error);
      throw error;
    }
  }

  // Send text message
  static async sendMessage(
    chatId: string,
    senderId: string,
    text: string,
    replyTo?: string
  ): Promise<string> {
    try {
      const messageData: Partial<Message> = {
        text,
        senderId,
        chatId,
        type: "text",
        status: "sent",
        timestamp: new Date(),
        ...(replyTo && { replyTo }),
      };

      // Add message to messages collection
      const messageRef = await addDoc(collection(db, "messages"), {
        ...messageData,
        timestamp: serverTimestamp(),
      });

      // Update chat's last message and unread counts
      await this.updateChatAfterMessage(
        chatId,
        messageRef.id,
        messageData as Message
      );

      return messageRef.id;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  }

  // Upload and send media message
  static async sendMediaMessage(
    chatId: string,
    senderId: string,
    mediaUri: string,
    type: "image" | "video" | "audio" | "document",
    fileName?: string,
    duration?: number
  ): Promise<string> {
    try {
      // Upload media file
      const mediaUrl = await this.uploadMedia(mediaUri, type, fileName);

      const messageData: Partial<Message> = {
        senderId,
        chatId,
        type,
        status: "sent",
        mediaUrl,
        mediaName: fileName,
        timestamp: new Date(),
        ...(duration && { duration }),
      };

      // Add message to messages collection
      const messageRef = await addDoc(collection(db, "messages"), {
        ...messageData,
        timestamp: serverTimestamp(),
      });

      // Update chat's last message
      await this.updateChatAfterMessage(
        chatId,
        messageRef.id,
        messageData as Message
      );

      return messageRef.id;
    } catch (error) {
      console.error("Send media message error:", error);
      throw error;
    }
  }

  // Upload media to Firebase Storage
  static async uploadMedia(
    uri: string,
    type: string,
    fileName?: string
  ): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename =
        fileName || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storageRef = ref(storage, `media/${type}/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Upload media error:", error);
      throw error;
    }
  }

  // Update chat after sending message
  static async updateChatAfterMessage(
    chatId: string,
    messageId: string,
    message: Message
  ): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chat = chatDoc.data() as Chat;
        const updateData: any = {
          lastMessageId: messageId,
          updatedAt: serverTimestamp(),
        };

        // Update unread counts for all participants except sender
        chat.participants.forEach((participantId) => {
          if (participantId !== message.senderId) {
            updateData[`unreadCount.${participantId}`] = increment(1);
          }
        });

        await updateDoc(chatRef, updateData);
      }
    } catch (error) {
      console.error("Update chat error:", error);
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      // Reset unread count for user
      await updateDoc(doc(db, "chats", chatId), {
        [`unreadCount.${userId}`]: 0,
      });

      // Update message status to read
      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        where("senderId", "!=", userId),
        where("status", "!=", "read")
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = [];

      messagesSnapshot.forEach((messageDoc) => {
        batch.push(
          updateDoc(doc(db, "messages", messageDoc.id), { status: "read" })
        );
      });

      await Promise.all(batch);
    } catch (error) {
      console.error("Mark messages as read error:", error);
    }
  }

  // Update typing status
  static async updateTypingStatus(
    chatId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);

      if (isTyping) {
        await updateDoc(chatRef, {
          typingUsers: arrayUnion(userId),
        });
      } else {
        await updateDoc(chatRef, {
          typingUsers: arrayRemove(userId),
        });
      }
    } catch (error) {
      console.error("Update typing status error:", error);
    }
  }

  // Delete message
  static async deleteMessage(
    messageId: string,
    forEveryone: boolean = false
  ): Promise<void> {
    try {
      if (forEveryone) {
        await deleteDoc(doc(db, "messages", messageId));
      } else {
        // Mark as deleted for current user only
        await updateDoc(doc(db, "messages", messageId), {
          deletedFor: arrayUnion(messageId), // Add current user ID
        });
      }
    } catch (error) {
      console.error("Delete message error:", error);
      throw error;
    }
  }

  // Get user's chats with real-time updates
  static subscribeToUserChats(
    userId: string,
    callback: (chats: Chat[]) => void
  ) {
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(chatsQuery, async (snapshot) => {
      const chats: Chat[] = [];

      for (const doc of snapshot.docs) {
        const chatData = doc.data() as Chat;

        // Get last message if exists
        if (chatData.lastMessageId) {
          const messageDoc = await getDoc(
            doc(db, "messages", chatData.lastMessageId)
          );
          if (messageDoc.exists()) {
            chatData.lastMessage = messageDoc.data() as Message;
          }
        }

        chats.push(chatData);
      }

      callback(chats);
    });
  }

  // Get chat messages with real-time updates
  static subscribeToChatMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ) {
    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc"),
      limit(limitCount)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const messageData = doc.data() as Message;
        messageData.id = doc.id;

        // Convert Firestore timestamp to Date
        if (messageData.timestamp instanceof Timestamp) {
          messageData.timestamp = messageData.timestamp.toDate();
        }

        messages.push(messageData);
      });

      callback(messages);
    });
  }

  // Add user to group chat
  static async addUserToGroup(
    chatId: string,
    userId: string,
    addedBy: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        participants: arrayUnion(userId),
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Add user to group error:", error);
      throw error;
    }
  }

  // Remove user from group chat
  static async removeUserFromGroup(
    chatId: string,
    userId: string
  ): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chat = chatDoc.data() as Chat;
        const updatedUnreadCount = { ...chat.unreadCount };
        delete updatedUnreadCount[userId];

        await updateDoc(chatRef, {
          participants: arrayRemove(userId),
          admins: arrayRemove(userId), // Remove from admins if they were admin
          unreadCount: updatedUnreadCount,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Remove user from group error:", error);
      throw error;
    }
  }
}
