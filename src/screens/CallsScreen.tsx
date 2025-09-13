import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../constants/Colors";

export default function CallsScreen() {
  const handleCall = (name: string, type: "audio" | "video") => {
    Alert.alert("Calling", `${type} calling ${name}...`);
  };

  const callHistory = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "👩‍💼",
      type: "outgoing" as const,
      callType: "video" as const,
      time: "10 minutes ago",
      duration: "15:30",
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "👨‍💻",
      type: "incoming" as const,
      callType: "audio" as const,
      time: "2 hours ago",
      duration: "08:15",
    },
    {
      id: "3",
      name: "Emma Davis",
      avatar: "👩‍🔬",
      type: "missed" as const,
      callType: "video" as const,
      time: "Yesterday",
      duration: null,
    },
    {
      id: "4",
      name: "David Wilson",
      avatar: "👨‍🎨",
      type: "outgoing" as const,
      callType: "audio" as const,
      time: "Yesterday",
      duration: "23:45",
    },
    {
      id: "5",
      name: "Lisa Park",
      avatar: "👩‍⚕️",
      type: "incoming" as const,
      callType: "video" as const,
      time: "2 days ago",
      duration: "12:20",
    },
  ];

  const getCallIcon = (type: (typeof callHistory)[0]["type"]) => {
    switch (type) {
      case "outgoing":
        return "call-outline";
      case "incoming":
        return "call-outline";
      case "missed":
        return "call-outline";
      default:
        return "call-outline";
    }
  };

  const getCallIconColor = (type: (typeof callHistory)[0]["type"]) => {
    switch (type) {
      case "outgoing":
        return Colors.secondary;
      case "incoming":
        return Colors.secondary;
      case "missed":
        return Colors.status.offline;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.createCallButton}
          onPress={() => Alert.alert("Coming Soon", "Create call link feature")}
        >
          <Ionicons name="link" size={20} color={Colors.secondary} />
          <Text style={styles.createCallText}>Create call link</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent</Text>

      {callHistory.map((call) => (
        <View key={call.id} style={styles.callItem}>
          <Text style={styles.avatar}>{call.avatar}</Text>

          <View style={styles.callInfo}>
            <Text
              style={[
                styles.callerName,
                call.type === "missed" && styles.missedCall,
              ]}
            >
              {call.name}
            </Text>

            <View style={styles.callDetails}>
              <Ionicons
                name={getCallIcon(call.type)}
                size={16}
                color={getCallIconColor(call.type)}
                style={call.type === "outgoing" && styles.outgoingIcon}
              />
              <Text style={styles.callTime}>
                {call.duration ? `${call.time}, ${call.duration}` : call.time}
              </Text>
            </View>
          </View>

          <View style={styles.callActions}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(call.name, "audio")}
            >
              <Ionicons name="call" size={20} color={Colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(call.name, "video")}
            >
              <Ionicons name="videocam" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {callHistory.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="call-outline" size={64} color={Colors.gray[400]} />
          <Text style={styles.emptyText}>No recent calls</Text>
          <Text style={styles.emptySubtext}>
            Your call history will appear here
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  createCallButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  createCallText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  avatar: {
    fontSize: 40,
    marginRight: 16,
  },
  callInfo: {
    flex: 1,
  },
  callerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  missedCall: {
    color: Colors.status.offline,
  },
  callDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  outgoingIcon: {
    transform: [{ rotate: "45deg" }],
  },
  callTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  callActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 8,
    textAlign: "center",
  },
});
