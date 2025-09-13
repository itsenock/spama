import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Message, RootStackParamList } from "../types";
import { Colors } from "../constants/Colors";
import { formatTime, generateId } from "../utils/helpers";
import { mockMessages, currentUser } from "../data/mockData";
import MessageBubble from "../components/MessageBubble";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Chat">;

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { chatId, chatName, avatar } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load messages for this chat
    const chatMessages = mockMessages
      .filter((msg) => msg.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setMessages(chatMessages);

    // Set custom header
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitle}
          onPress={() => Alert.alert("Coming Soon", "Contact info screen")}
        >
          <Text style={styles.headerAvatar}>{avatar}</Text>
          <View>
            <Text style={styles.headerName}>{chatName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert("Coming Soon", "Video call feature")}
          >
            <Ionicons name="videocam" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert("Coming Soon", "Voice call feature")}
          >
            <Ionicons name="call" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert("Coming Soon", "More options")}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, chatId, chatName, avatar]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: generateId(),
      text: newMessage.trim(),
      senderId: currentUser.id,
      chatId,
      timestamp: new Date(),
      status: "sending",
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 2000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 3000);

    // Simulate auto-reply (for demo purposes)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replies = [
          "That's interesting! 🤔",
          "I totally agree with you!",
          "Thanks for sharing that 😊",
          "Let me think about it...",
          "Sounds good to me!",
          "What do you think about this?",
        ];

        const reply: Message = {
          id: generateId(),
          text: replies[Math.floor(Math.random() * replies.length)],
          senderId: "user-2", // Simulate other user
          chatId,
          timestamp: new Date(),
          status: "sent",
          type: "text",
        };

        setMessages((prev) => [...prev, reply]);
      }, 4000);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === currentUser.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showTimestamp =
      !previousMessage ||
      item.timestamp.getTime() - previousMessage.timestamp.getTime() > 300000; // 5 minutes

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showTimestamp={showTimestamp}
      />
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>typing...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
        />
        {renderTypingIndicator()}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => Alert.alert("Coming Soon", "Attachment feature")}
          >
            <Ionicons name="add" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              placeholderTextColor={Colors.text.light}
            />
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => Alert.alert("Coming Soon", "Emoji picker")}
            >
              <Ionicons
                name="happy-outline"
                size={20}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : null,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons
              name={newMessage.trim() ? "send" : "mic"}
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.chat,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.gray[200],
  },
  headerActions: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.text.light,
    fontStyle: "italic",
  },
  inputContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 80,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.gray[400],
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.secondary,
  },
});
