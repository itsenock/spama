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

export default function StatusScreen() {
  const handleAddStatus = () => {
    Alert.alert("Coming Soon", "Status update feature will be implemented");
  };

  const handleViewStatus = (name: string) => {
    Alert.alert("Status Viewer", `Viewing ${name}'s status`);
  };

  const statusUpdates = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "👩‍💼",
      time: "45 minutes ago",
      viewed: false,
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "👨‍💻",
      time: "2 hours ago",
      viewed: true,
    },
    {
      id: "3",
      name: "Emma Davis",
      avatar: "👩‍🔬",
      time: "5 hours ago",
      viewed: false,
    },
    {
      id: "4",
      name: "David Wilson",
      avatar: "👨‍🎨",
      time: "1 day ago",
      viewed: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* My Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My status</Text>
        <TouchableOpacity style={styles.statusItem} onPress={handleAddStatus}>
          <View style={styles.avatarContainer}>
            <Text style={styles.myAvatar}>👤</Text>
            <View style={styles.addButton}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusName}>My status</Text>
            <Text style={styles.statusTime}>Tap to add status update</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Updates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent updates</Text>
        {statusUpdates.map((status) => (
          <TouchableOpacity
            key={status.id}
            style={styles.statusItem}
            onPress={() => handleViewStatus(status.name)}
          >
            <View
              style={[
                styles.statusAvatarContainer,
                !status.viewed && styles.unviewedBorder,
              ]}
            >
              <Text style={styles.statusAvatar}>{status.avatar}</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusName}>{status.name}</Text>
              <Text style={styles.statusTime}>{status.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Muted Updates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muted updates</Text>
        <View style={styles.emptySection}>
          <Ionicons
            name="volume-mute-outline"
            size={48}
            color={Colors.gray[400]}
          />
          <Text style={styles.emptyText}>No muted updates</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  myAvatar: {
    fontSize: 48,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  statusAvatarContainer: {
    position: "relative",
    marginRight: 16,
    borderRadius: 30,
    padding: 3,
  },
  unviewedBorder: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  statusAvatar: {
    fontSize: 42,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statusTime: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
  },
});
