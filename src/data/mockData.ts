import { User, Chat, Message, Contact } from "../types";
import { generateId } from "../utils/helpers";

export const currentUser: User = {
  id: "user-1",
  name: "You",
  phone: "+1 234-567-8900",
  avatar: "👤",
  online: true,
  status: "Hey there! I am using WhatsApp.",
};

export const mockUsers: User[] = [
  {
    id: "user-2",
    name: "Sarah Johnson",
    phone: "+1 234-567-8901",
    avatar: "👩‍💼",
    online: true,
    status: "Working from home 🏠",
  },
  {
    id: "user-3",
    name: "Mike Chen",
    phone: "+1 234-567-8902",
    avatar: "👨‍💻",
    online: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "Coding is life 💻",
  },
  {
    id: "user-4",
    name: "Emma Davis",
    phone: "+1 234-567-8903",
    avatar: "👩‍🔬",
    online: true,
    status: "Science enthusiast 🔬",
  },
  {
    id: "user-5",
    name: "David Wilson",
    phone: "+1 234-567-8904",
    avatar: "👨‍🎨",
    online: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: "Creating art 🎨",
  },
  {
    id: "user-6",
    name: "Lisa Park",
    phone: "+1 234-567-8905",
    avatar: "👩‍⚕️",
    online: true,
    status: "Helping others heal ❤️",
  },
];

export const mockMessages: Message[] = [
  {
    id: generateId(),
    text: "Hey! How are you doing?",
    senderId: "user-2",
    chatId: "chat-1",
    timestamp: new Date(Date.now() - 3600000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "I am doing great! Thanks for asking 😊 How about you?",
    senderId: currentUser.id,
    chatId: "chat-1",
    timestamp: new Date(Date.now() - 3300000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "That's awesome to hear! I'm doing well too.",
    senderId: "user-2",
    chatId: "chat-1",
    timestamp: new Date(Date.now() - 3000000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "What are your plans for the weekend?",
    senderId: "user-2",
    chatId: "chat-1",
    timestamp: new Date(Date.now() - 1800000),
    status: "delivered",
    type: "text",
  },
  {
    id: generateId(),
    text: "Meeting at 3 PM today. Don't forget!",
    senderId: "user-3",
    chatId: "chat-2",
    timestamp: new Date(Date.now() - 7200000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "Got it! See you there 👍",
    senderId: currentUser.id,
    chatId: "chat-2",
    timestamp: new Date(Date.now() - 7000000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "Check out this amazing sunset! 🌅",
    senderId: "user-4",
    chatId: "chat-3",
    timestamp: new Date(Date.now() - 86400000),
    status: "read",
    type: "text",
  },
  {
    id: generateId(),
    text: "Wow! That's beautiful! Where was this taken?",
    senderId: currentUser.id,
    chatId: "chat-3",
    timestamp: new Date(Date.now() - 86200000),
    status: "read",
    type: "text",
  },
];

export const mockChats: Chat[] = [
  {
    id: "chat-1",
    type: "individual",
    participants: [currentUser.id, "user-2"],
    lastMessage: mockMessages.find(
      (m) => m.chatId === "chat-1" && m.senderId === "user-2"
    ),
    unreadCount: 2,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: "chat-2",
    type: "individual",
    participants: [currentUser.id, "user-3"],
    lastMessage: mockMessages.find(
      (m) => m.chatId === "chat-2" && m.senderId === currentUser.id
    ),
    unreadCount: 0,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 7000000),
  },
  {
    id: "chat-3",
    type: "individual",
    participants: [currentUser.id, "user-4"],
    lastMessage: mockMessages.find(
      (m) => m.chatId === "chat-3" && m.senderId === currentUser.id
    ),
    unreadCount: 0,
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86200000),
  },
  {
    id: "chat-4",
    type: "group",
    name: "Family Group",
    participants: [currentUser.id, "user-5", "user-6"],
    lastMessage: {
      id: generateId(),
      text: "Dinner tomorrow at 7 PM?",
      senderId: "user-5",
      chatId: "chat-4",
      timestamp: new Date(Date.now() - 43200000),
      status: "delivered",
      type: "text",
    },
    unreadCount: 3,
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 43200000),
    avatar: "👨‍👩‍👧‍👦",
  },
];

export const mockContacts: Contact[] = mockUsers.map((user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  avatar: user.avatar,
  online: user.online,
  isContact: true,
}));
