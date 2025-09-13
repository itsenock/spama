import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Message } from "../types";
import { Colors } from "../constants/Colors";
import { formatTime, getMessageStatusIcon } from "../utils/helpers";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showTimestamp?: boolean;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  showTimestamp = false,
}: MessageBubbleProps) {
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
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
          >
            {message.text}
          </Text>

          <View style={styles.messageFooter}>
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
  },
  timeText: {
    fontSize: 11,
    marginTop: 2,
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
});
