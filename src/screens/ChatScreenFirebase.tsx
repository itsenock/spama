import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Modal,
  Button,
} from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../types";

// ✅ Declare types once
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;
type NavigationProp = StackNavigationProp<RootStackParamList, "Chat">;

interface Props {
  route: ChatScreenRouteProp;
  navigation: NavigationProp;
}

interface Message {
  id: string;
  text?: string;
  createdAt: any;
  user: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
}

// ✅ Reusable component for displaying messages
function EnhancedMessageBubble({ message, currentUser }: { message: Message; currentUser: string }) {
  const isCurrentUser = message.user === currentUser;
  return (
    <View
      style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
      ]}
    >
      {message.text ? <Text style={styles.messageText}>{message.text}</Text> : null}
      {message.mediaUrl ? (
        message.mediaType === "image" ? (
          <Image
            source={{ uri: message.mediaUrl }}
            style={{ width: 150, height: 150, borderRadius: 8, marginTop: 5 }}
            resizeMode="cover"
          />
        ) : message.mediaType === "audio" ? (
          <Text style={{ color: "white" }}>🎵 Audio message</Text>
        ) : null
      ) : null}
    </View>
  );
}

// ✅ Media picker component
function MediaPicker({ onPick }: { onPick: (uri: string, type: "image" | "video") => void }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      onPick(asset.uri, type);
    }
  };
  return (
    <TouchableOpacity onPress={pickImage} style={{ marginHorizontal: 5 }}>
      <Ionicons name="image" size={28} color="green" />
    </TouchableOpacity>
  );
}

// ✅ Audio recorder component
function AudioRecorder({ onFinish }: { onFinish: (uri: string) => void }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) onFinish(uri);
  };

  return (
    <TouchableOpacity
      onPress={recording ? stopRecording : startRecording}
      style={{ marginHorizontal: 5 }}
    >
      <Ionicons
        name={recording ? "stop-circle" : "mic"}
        size={28}
        color={recording ? "red" : "blue"}
      />
    </TouchableOpacity>
  );
}

// ✅ Final, single definition
export default function ChatScreenFirebase({ route }: Props) {
  const { chatId, currentUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const db = getFirestore();
  const storage = getStorage();
  const flatListRef = useRef<FlatList>(null);

  // Load messages
  useEffect(() => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async (text?: string, mediaUrl?: string, mediaType?: Message["mediaType"]) => {
    if (!text && !mediaUrl) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      createdAt: serverTimestamp(),
      user: currentUser,
      mediaUrl,
      mediaType,
    });
    setNewMessage("");
  };

  const handleMediaUpload = async (uri: string, type: "image" | "video" | "audio") => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}.${type}`;
      const storageRef = ref(storage, `chatMedia/${chatId}/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      await sendMessage(undefined, downloadURL, type);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => item.mediaType === "image" && setFullscreenImage(item.mediaUrl || null)}
          >
            <EnhancedMessageBubble message={item} currentUser={currentUser} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <MediaPicker onPick={(uri, type) => handleMediaUpload(uri, type)} />
        <AudioRecorder onFinish={(uri) => handleMediaUpload(uri, "audio")} />
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.textInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={() => sendMessage(newMessage)}>
          <Ionicons name="send" size={28} color="blue" />
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Viewer */}
      <Modal visible={!!fullscreenImage} transparent>
        <View style={styles.fullscreenOverlay}>
          <Image
            source={{ uri: fullscreenImage || "" }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <Button title="Close" onPress={() => setFullscreenImage(null)} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    maxWidth: "75%",
  },
  currentUserBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherUserBubble: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
});
