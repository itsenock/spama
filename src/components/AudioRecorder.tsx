import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Colors } from "../constants/Colors";
import { MediaService } from "../services/mediaService";

interface AudioRecorderProps {
  visible: boolean;
  onRecordingComplete: (audioUri: string, duration: number) => void;
  onCancel: () => void;
}

export default function AudioRecorder({
  visible,
  onRecordingComplete,
  onCancel,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef(
    Array.from({ length: 30 }, () => new Animated.Value(0.3))
  ).current;

  const durationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      startRecording();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      stopRecording();
    };
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Waveform animation
      const animateWaveform = () => {
        const animations = waveformAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150,
            useNativeDriver: true,
          })
        );

        Animated.stagger(50, animations).start(() => {
          if (isRecording) {
            setTimeout(animateWaveform, 100);
          }
        });
      };

      animateWaveform();

      // Duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.stopAnimation();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      Vibration.vibrate(50); // Short vibration to indicate start
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri && recordingDuration > 0) {
        onRecordingComplete(uri, recordingDuration);
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setRecordingDuration(0);
      } catch (error) {
        console.error("Failed to cancel recording:", error);
      }
    }
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {/* Recording indicator */}
        <Animated.View
          style={[
            styles.recordingIndicator,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.recordingDot} />
        </Animated.View>

        {/* Waveform visualization */}
        <View style={styles.waveformContainer}>
          {waveformAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  transform: [{ scaleY: anim }],
                },
              ]}
            />
          ))}
        </View>

        {/* Duration display */}
        <Text style={styles.durationText}>
          {formatDuration(recordingDuration)}
        </Text>

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelRecording}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
            activeOpacity={0.7}
            disabled={recordingDuration < 1} // Minimum 1 second
          >
            <Ionicons name="checkmark" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Instruction text */}
        <Text style={styles.instructionText}>
          {recordingDuration < 1
            ? "Recording... Speak now"
            : "Tap ✓ to send or ✕ to cancel"}
        </Text>
      </View>

      {/* Slide to cancel indicator */}
      <View style={styles.slideIndicator}>
        <Ionicons name="chevron-up" size={16} color={Colors.text.light} />
        <Text style={styles.slideText}>Slide up to cancel</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    alignItems: "center",
  },
  recordingIndicator: {
    marginBottom: 20,
  },
  recordingDot: {
    width: 20,
    height: 20,
    backgroundColor: "#ff4757",
    borderRadius: 10,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    marginBottom: 16,
  },
  waveformBar: {
    width: 3,
    height: 40,
    backgroundColor: Colors.primary,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  durationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 20,
    fontFamily: "monospace",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cancelButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.gray[200],
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 40,
  },
  stopButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.secondary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  slideIndicator: {
    alignItems: "center",
    marginTop: 8,
  },
  slideText: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 2,
  },
});
