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
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Message, RootStackParamList } from "../types";
import { Colors } from "../constants/Colors";
import { formatTime } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { ChatService } from "../services/chatService";
import { MediaService, MediaResult } from "../services/mediaService";
import EnhancedMessageBubble from "../components/EnhancedMessageBubble";
import MediaPicker from "../components/MediaPicker";
import AudioRecorder from "../components/AudioRecorder";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Chat">;

export default function ChatScreenFirebase() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { chatId, chatName, avatar } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !chatId) return;

    // Subscribe to messages
    const unsubscribeMessages = ChatService.subscribeToChatMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);
        // Auto-scroll to bottom for new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    // Mark messages as read when entering chat
    ChatService.markMessagesAsRead(chatId, user.id);

    return () => {
      unsubscribeMessages();
    };
  }, [chatId, user]);

  useEffect(() => {
    // Set custom header with online status and actions
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitle}
          onPress={() => Alert.alert("Coming Soon", "Contact info screen")}
        >
          <Text style={styles.headerAvatar}>{avatar}</Text>
          <View>
            <Text style={styles.headerName}>{chatName}</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? "typing..." : "Online"}
            </Text>
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
  }, [navigation, chatName, avatar, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setLoading(true);

    try {
      await ChatService.sendMessage(chatId, user.id, messageText);
    } catch (error) {
      console.error("Send message error:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!user) return;

    // Update typing status
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      ChatService.updateTypingStatus(chatId, user.id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      ChatService.updateTypingStatus(chatId, user.id, false);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        ChatService.updateTypingStatus(chatId, user.id, false);
      }
    }, 3000);
  };

  const handleMediaSelected = async (media: MediaResult) => {
    if (!user) return;

    try {
      setUploadingMedia(true);
      setUploadProgress(0);

      // Upload media to Firebase Storage
      const mediaUrl = await MediaService.uploadMedia(
        media,
        user.id,
        (progress) => setUploadProgress(progress)
      );

      // Send media message
      await ChatService.sendMediaMessage(
        chatId,
        user.id,
        mediaUrl,
        media.type,
        media.name,
        media.duration
      );

      setUploadingMedia(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Media upload error:", error);
      Alert.alert("Error", "Failed to send media");
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const handleAudioRecordingComplete = async (
    audioUri: string,
    duration: number
  ) => {
    if (!user) return;

    try {
      setUploadingMedia(true);

      const mediaResult: MediaResult = {
        uri: audioUri,
        type: "audio",
        name: `voice_${Date.now()}.m4a`,
        duration,
      };

      await handleMediaSelected(mediaResult);
      setShowAudioRecorder(false);
    } catch (error) {
      console.error("Audio message error:", error);
      Alert.alert("Error", "Failed to send voice message");
      setShowAudioRecorder(false);
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const handleVideoPress = (videoUrl: string) => {
    Alert.alert("Video Player", "Video player will be implemented");
  };

  const handleDocumentPress = (documentUrl: string, fileName: string) => {
    Alert.alert("Document", `Opening ${fileName}...`);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    if (!user) return null;

    const isCurrentUser = item.senderId === user.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showTimestamp =
      !previousMessage ||
      item.timestamp.getTime() - previousMessage.timestamp.getTime() > 300000; // 5 minutes

    return (
      <EnhancedMessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showTimestamp={showTimestamp}
        onImagePress={handleImagePress}
        onVideoPress={handleVideoPress}
        onDocumentPress={handleDocumentPress}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Start your conversation</Text>
      <Text style={styles.emptyStateSubtext}>
        Messages are end-to-end encrypted. Tap to learn more.
      </Text>
    </View>
  );

  const renderUploadProgress = () => {
    if (!uploadingMedia) return null;

    return (
      <View style={styles.uploadProgressContainer}>
        <View style={styles.uploadProgressBar}>
          <View
            style={[styles.uploadProgressFill, { width: `${uploadProgress}%` }]}
          />
        </View>
        <Text style={styles.uploadProgressText}>
          Uploading... {Math.round(uploadProgress)}%
        </Text>
      </View>
    );
  };

  if (!user) return null;

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
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
      </View>

      {renderUploadProgress()}

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowMediaPicker(true)}
            disabled={uploadingMedia}
          >
            <Ionicons name="add" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              placeholderTextColor={Colors.text.light}
              editable={!loading && !uploadingMedia}
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
            onPress={
              newMessage.trim()
                ? handleSendMessage
                : () => setShowAudioRecorder(true)
            }
            disabled={loading || uploadingMedia}
          >
            <Ionicons
              name={newMessage.trim() ? "send" : "mic"}
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Picker Modal */}
      <MediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelected={handleMediaSelected}
        onStartRecording={() => {
          setShowMediaPicker(false);
          setShowAudioRecorder(true);
        }}
      />

      {/* Audio Recorder */}
      <AudioRecorder
        visible={showAudioRecorder}
        onRecordingComplete={handleAudioRecordingComplete}
        onCancel={() => setShowAudioRecorder(false)}
      />

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity
            style={styles.fullScreenImageBackdrop}
            onPress={() => setFullScreenImage(null)}
          >
            <View style={styles.fullScreenImageHeader}>
              <TouchableOpacity
                style={styles.fullScreenImageClose}
                onPress={() => setFullScreenImage(null)}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            {fullScreenImage && (
              <Image
                source={{ uri: fullScreenImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: "center",
  },
  uploadProgressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: 8,
  },
  uploadProgressFill: {
    height: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  uploadProgressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
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
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  fullScreenImageBackdrop: {
    flex: 1,
  },
  fullScreenImageHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  fullScreenImageClose: {
    padding: 8,
  },
  fullScreenImage: {
    flex: 1,
    width: "100%",
  },
});
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
import { formatTime } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { ChatService } from "../services/chatService";
import MessageBubble from "../components/MessageBubble";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Chat">;

export default function ChatScreenFirebase() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { chatId, chatName, avatar } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !chatId) return;

    // Subscribe to messages
    const unsubscribeMessages = ChatService.subscribeToChatMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);
        // Auto-scroll to bottom for new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    // Mark messages as read when entering chat
    ChatService.markMessagesAsRead(chatId, user.id);

    return () => {
      unsubscribeMessages();
    };
  }, [chatId, user]);

  useEffect(() => {
    // Set custom header with online status and actions
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
  }, [navigation, chatName, avatar]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setLoading(true);

    try {
      await ChatService.sendMessage(chatId, user.id, messageText);
    } catch (error) {
      console.error("Send message error:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!user) return;

    // Update typing status
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      ChatService.updateTypingStatus(chatId, user.id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      ChatService.updateTypingStatus(chatId, user.id, false);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        ChatService.updateTypingStatus(chatId, user.id, false);
      }
    }, 3000);
  };

  const handleMediaPress = () => {
    Alert.alert("Send Media", "Choose media type", [
      { text: "Camera", onPress: () => openCamera() },
      { text: "Gallery", onPress: () => openGallery() },
      { text: "Document", onPress: () => openDocuments() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = () => {
    Alert.alert("Coming Soon", "Camera integration will be implemented");
  };

  const openGallery = () => {
    Alert.alert("Coming Soon", "Gallery integration will be implemented");
  };

  const openDocuments = () => {
    Alert.alert("Coming Soon", "Document picker will be implemented");
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    if (!user) return null;

    const isCurrentUser = item.senderId === user.id;
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Start your conversation</Text>
      <Text style={styles.emptyStateSubtext}>
        Messages are end-to-end encrypted. Tap to learn more.
      </Text>
    </View>
  );

  if (!user) return null;

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
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleMediaPress}
          >
            <Ionicons name="add" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              placeholderTextColor={Colors.text.light}
              editable={!loading}
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
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || loading}
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
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: "center",
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
