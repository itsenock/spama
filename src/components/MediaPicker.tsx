import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { MediaService, MediaResult } from "../services/mediaService";

interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaResult) => void;
  onStartRecording?: () => void;
}

const { height: screenHeight } = Dimensions.get("window");

export default function MediaPicker({
  visible,
  onClose,
  onMediaSelected,
  onStartRecording,
}: MediaPickerProps) {
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: screenHeight,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleMediaAction = async (
    action: () => Promise<MediaResult | null>,
    type: string
  ) => {
    try {
      setLoading(true);
      setLoadingType(type);

      const result = await action();
      if (result) {
        onMediaSelected(result);
        onClose();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to ${type.toLowerCase()}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const mediaOptions = [
    {
      id: "camera-photo",
      icon: "camera",
      title: "Camera",
      subtitle: "Take a photo",
      color: Colors.secondary,
      action: () => handleMediaAction(MediaService.takePhoto, "Take Photo"),
    },
    {
      id: "camera-video",
      icon: "videocam",
      title: "Video",
      subtitle: "Record a video",
      color: "#ff6b6b",
      action: () => handleMediaAction(MediaService.recordVideo, "Record Video"),
    },
    {
      id: "gallery-photo",
      icon: "images",
      title: "Photo",
      subtitle: "Choose from gallery",
      color: "#4ecdc4",
      action: () => handleMediaAction(MediaService.pickImage, "Pick Photo"),
    },
    {
      id: "gallery-video",
      icon: "film",
      title: "Gallery Video",
      subtitle: "Choose video from gallery",
      color: "#45b7d1",
      action: () => handleMediaAction(MediaService.pickVideo, "Pick Video"),
    },
    {
      id: "document",
      icon: "document-text",
      title: "Document",
      subtitle: "Share a file",
      color: "#f7b731",
      action: () =>
        handleMediaAction(MediaService.pickDocument, "Pick Document"),
    },
    {
      id: "audio",
      icon: "mic",
      title: "Audio",
      subtitle: "Record voice message",
      color: "#5f27cd",
      action: () => {
        onStartRecording?.();
        onClose();
      },
    },
    {
      id: "location",
      icon: "location",
      title: "Location",
      subtitle: "Share your location",
      color: "#00d2d3",
      action: () => {
        Alert.alert("Coming Soon", "Location sharing will be implemented");
        onClose();
      },
    },
    {
      id: "contact",
      icon: "person",
      title: "Contact",
      subtitle: "Share a contact",
      color: "#fd79a8",
      action: () => {
        Alert.alert("Coming Soon", "Contact sharing will be implemented");
        onClose();
      },
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {mediaOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={option.action}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.color },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={Colors.white}
                  />
                  {loading && loadingType === option.title && (
                    <View style={styles.loadingOverlay}>
                      <View style={styles.loadingSpinner} />
                    </View>
                  )}
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.light}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: screenHeight * 0.8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.white,
    borderTopColor: "transparent",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  cancelButton: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
});
