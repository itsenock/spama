import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import { Message } from "../types";
import { Colors } from "../constants/Colors";
import { formatTime, getMessageStatusIcon } from "../utils/helpers";
import { MediaService } from "../services/mediaService";

interface EnhancedMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showTimestamp?: boolean;
  onImagePress?: (imageUrl: string) => void;
  onVideoPress?: (videoUrl: string) => void;
  onDocumentPress?: (documentUrl: string, fileName: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const maxImageWidth = screenWidth * 0.6;

export default function EnhancedMessageBubble({
  message,
  isCurrentUser,
  showTimestamp = false,
  onImagePress,
  onVideoPress,
  onDocumentPress,
}: EnhancedMessageBubbleProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAudioPress = async () => {
    try {
      if (!message.mediaUrl) return;

      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound && !isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.mediaUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      Alert.alert("Error", "Could not play audio message");
    }
  };

  const renderTextMessage = () => (
    <Text
      style={[
        styles.messageText,
        isCurrentUser ? styles.sentText : styles.receivedText,
      ]}
    >
      {message.text}
    </Text>
  );

  const renderImageMessage = () => (
    <TouchableOpacity
      onPress={() => onImagePress?.(message.mediaUrl!)}
      style={styles.imageContainer}
    >
      {!imageError ? (
        <Image
          source={{ uri: message.mediaUrl }}
          style={styles.messageImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.mediaError}>
          <Ionicons name="image-outline" size={32} color={Colors.text.light} />
          <Text style={styles.errorText}>Image unavailable</Text>
        </View>
      )}
      {message.text && (
        <View style={styles.imageCaption}>
          <Text
            style={[
              styles.messageCaptionText,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderVideoMessage = () => (
    <TouchableOpacity
      onPress={() => onVideoPress?.(message.mediaUrl!)}
      style={styles.videoContainer}
    >
      <Image
        source={{ uri: message.mediaUrl }}
        style={styles.messageVideo}
        resizeMode="cover"
      />
      <View style={styles.videoOverlay}>
        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
      </View>
      {message.duration && (
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>
            {MediaService.formatDuration(message.duration)}
          </Text>
        </View>
      )}
      {message.text && (
        <View style={styles.imageCaption}>
          <Text
            style={[
              styles.messageCaptionText,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAudioMessage = () => (
    <TouchableOpacity onPress={handleAudioPress} style={styles.audioContainer}>
      <View style={styles.audioContent}>
        <View
          style={[
            styles.audioButton,
            isCurrentUser ? styles.audioButtonSent : styles.audioButtonReceived,
          ]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={isCurrentUser ? Colors.white : Colors.primary}
          />
        </View>
        <View style={styles.audioInfo}>
          <View style={styles.audioWaveform}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 20 + 5,
                    backgroundColor: isCurrentUser
                      ? "rgba(255,255,255,0.6)"
                      : Colors.primary,
                  },
                ]}
              />
            ))}
          </View>
          <Text
            style={[
              styles.audioDuration,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
          >
            {message.duration
              ? MediaService.formatDuration(message.duration)
              : "0:00"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDocumentMessage = () => (
    <TouchableOpacity
      onPress={() =>
        onDocumentPress?.(message.mediaUrl!, message.mediaName || "Document")
      }
      style={styles.documentContainer}
    >
      <View style={styles.documentContent}>
        <View
          style={[
            styles.documentIcon,
            isCurrentUser
              ? styles.documentIconSent
              : styles.documentIconReceived,
          ]}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={isCurrentUser ? Colors.white : Colors.primary}
          />
        </View>
        <View style={styles.documentInfo}>
          <Text
            style={[
              styles.documentName,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
            numberOfLines={1}
          >
            {message.mediaName || "Document"}
          </Text>
          <Text
            style={[
              styles.documentSize,
              isCurrentUser ? styles.sentSubText : styles.receivedSubText,
            ]}
          >
            {message.mediaSize
              ? MediaService.formatFileSize(message.mediaSize)
              : "Unknown size"}
          </Text>
        </View>
        <Ionicons
          name="download-outline"
          size={20}
          color={
            isCurrentUser ? "rgba(255,255,255,0.7)" : Colors.text.secondary
          }
        />
      </View>
    </TouchableOpacity>
  );

  const renderLocationMessage = () => (
    <TouchableOpacity style={styles.locationContainer}>
      <View style={styles.locationMap}>
        <Ionicons name="location" size={32} color={Colors.primary} />
        <Text style={styles.locationText}>Location</Text>
      </View>
      {message.location?.address && (
        <Text
          style={[
            styles.locationAddress,
            isCurrentUser ? styles.sentText : styles.receivedText,
          ]}
        >
          {message.location.address}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return renderImageMessage();
      case "video":
        return renderVideoMessage();
      case "audio":
        return renderAudioMessage();
      case "document":
        return renderDocumentMessage();
      case "location":
        return renderLocationMessage();
      case "text":
      default:
        return renderTextMessage();
    }
  };

  return (
    <View style={styles.container}>
      {showTimestamp && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      )}

      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentContainer : styles.receivedContainer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isCurrentUser ? styles.sentBubble : styles.receivedBubble,
            message.type !== "text" && !message.text && styles.mediaBubble,
          ]}
        >
          {renderMessageContent()}

          <View style={styles.messageFooter}>
            {message.edited && (
              <Text
                style={[
                  styles.editedText,
                  isCurrentUser ? styles.sentTimeText : styles.receivedTimeText,
                ]}
              >
                edited
              </Text>
            )}
            <Text
              style={[
                styles.timeText,
                isCurrentUser ? styles.sentTimeText : styles.receivedTimeText,
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>

            {isCurrentUser && (
              <Text
                style={[
                  styles.statusIcon,
                  message.status === "read" && styles.readStatusIcon,
                ]}
              >
                {getMessageStatusIcon(message.status)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  timestampContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.light,
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 2,
  },
  sentContainer: {
    justifyContent: "flex-end",
  },
  receivedContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mediaBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  sentBubble: {
    backgroundColor: Colors.message.sent,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: Colors.message.received,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  sentText: {
    color: Colors.text.primary,
  },
  receivedText: {
    color: Colors.text.primary,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  editedText: {
    fontSize: 11,
    fontStyle: "italic",
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
  },
  sentTimeText: {
    color: Colors.text.secondary,
  },
  receivedTimeText: {
    color: Colors.text.light,
  },
  statusIcon: {
    fontSize: 11,
    marginLeft: 4,
    color: Colors.text.secondary,
  },
  readStatusIcon: {
    color: Colors.secondary,
  },
  // Image styles
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    maxWidth: maxImageWidth,
  },
  messageImage: {
    width: maxImageWidth,
    height: maxImageWidth * 0.75,
    borderRadius: 12,
  },
  imageCaption: {
    padding: 8,
  },
  messageCaptionText: {
    fontSize: 14,
    lineHeight: 18,
  },
  mediaError: {
    width: maxImageWidth,
    height: maxImageWidth * 0.75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray[200],
  },
  errorText: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
  },
  // Video styles
  videoContainer: {
    borderRadius: 12,
    overflow: "hidden",
    maxWidth: maxImageWidth,
  },
  messageVideo: {
    width: maxImageWidth,
    height: maxImageWidth * 0.75,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  videoDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.white,
    fontSize: 12,
  },
  // Audio styles
  audioContainer: {
    minWidth: 200,
  },
  audioContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  audioButtonSent: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  audioButtonReceived: {
    backgroundColor: Colors.gray[200],
  },
  audioInfo: {
    flex: 1,
  },
  audioWaveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 30,
    marginBottom: 4,
  },
  waveformBar: {
    width: 2,
    marginRight: 1,
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
  },
  // Document styles
  documentContainer: {
    minWidth: 200,
  },
  documentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentIconSent: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  documentIconReceived: {
    backgroundColor: Colors.gray[200],
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
  },
  sentSubText: {
    color: "rgba(255,255,255,0.7)",
  },
  receivedSubText: {
    color: Colors.text.secondary,
  },
  // Location styles
  locationContainer: {
    minWidth: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  locationMap: {
    height: 120,
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  locationAddress: {
    padding: 8,
    fontSize: 14,
  },
});
