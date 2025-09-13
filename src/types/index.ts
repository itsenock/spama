export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  online: boolean;
  lastSeen?: Date;
  status?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  chatId: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "audio" | "video" | "document";
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  type: "individual" | "group";
  name?: string; // For group chats
  participants: string[]; // User IDs
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  online: boolean;
  isContact: boolean;
  addedAt?: Date;
  lastSeen?: Date;
  status?: string;
}

export interface StatusUpdate {
  id: string;
  userId: string;
  type: "text" | "image" | "video";
  content: string;
  mediaUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  timestamp: Date;
  expiresAt: Date;
  viewers: string[];
  privacy: "all" | "contacts" | "selected" | "except";
  selectedContacts?: string[];
  exceptContacts?: string[];
}

export interface Call {
  id: string;
  type: "audio" | "video";
  status: "incoming" | "outgoing" | "missed" | "rejected";
  participants: string[];
  initiatedBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "call" | "group_invite" | "contact_joined";
  title: string;
  body: string;
  data?: any;
  read: boolean;
  timestamp: Date;
}

export type RootStackParamList = {
  Main: undefined;
  Chat: { chatId: string; chatName: string; avatar: string };
  ContactInfo: { contactId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Chats: undefined;
  Status: undefined;
  Calls: undefined;
  Contacts: undefined;
};
