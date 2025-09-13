import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Chat, User } from "../types";
import { Colors } from "../constants/Colors";
import {
  formatChatTime,
  truncateText,
  getMessageStatusIcon,
} from "../utils/helpers";
import { currentUser } from "../data/mockData";

interface ChatItemProps {
  chat: Chat;
  chatName: string;
  avatar: string;
  otherUser?: User;
  onPress: () => void;
}

export default function ChatItem({
  chat,
  chatName,
  avatar,
  otherUser,
  onPress,
}: ChatItemProps) {
  const lastMessage = chat.lastMessage;
  const isOnline = otherUser?.online || false;

  const getLastMessageText = (): string => {
    if (!lastMessage) return "No messages yet";

    const prefix = lastMessage.senderId === currentUser.id ? "You: " : "";
    return prefix + truncateText(lastMessage.text, 30);
  };

  const getLastMessageTime = (): string => {
    if (!lastMessage) return "";
    return formatChatTime(lastMessage.timestamp);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{avatar}</Text>
        {isOnline && chat.type === "individual" && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {chatName}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{getLastMessageTime()}</Text>
            {lastMessage && lastMessage.senderId === currentUser.id && (
              <Text
                style={[
                  styles.statusIcon,
                  lastMessage.status === "read" && styles.readStatus,
                ]}
              >
                {getMessageStatusIcon(lastMessage.status)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessageText()}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    fontSize: 40,
    textAlign: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: Colors.status.online,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: Colors.text.light,
  },
  statusIcon: {
    fontSize: 12,
    color: Colors.text.light,
    marginLeft: 4,
  },
  readStatus: {
    color: Colors.secondary,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.white,
  },
});
