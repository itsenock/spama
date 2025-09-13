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

export default function ContactInfoScreen() {
  const handleAction = (action: string) => {
    Alert.alert("Coming Soon", `${action} feature will be implemented`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Text style={styles.profileAvatar}>👩‍💼</Text>
        <Text style={styles.profileName}>Sarah Johnson</Text>
        <Text style={styles.profilePhone}>+1 234-567-8901</Text>
        <Text style={styles.profileStatus}>Working from home 🏠</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAction("Audio call")}
        >
          <Ionicons name="call" size={24} color={Colors.secondary} />
          <Text style={styles.actionText}>Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAction("Video call")}
        >
          <Ionicons name="videocam" size={24} color={Colors.secondary} />
          <Text style={styles.actionText}>Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAction("Search")}
        >
          <Ionicons name="search" size={24} color={Colors.secondary} />
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction("Media, links, and docs")}
        >
          <Ionicons
            name="folder-outline"
            size={24}
            color={Colors.text.secondary}
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Media, links, and docs</Text>
            <Text style={styles.optionSubtitle}>12 items</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction("Starred messages")}
        >
          <Ionicons
            name="star-outline"
            size={24}
            color={Colors.text.secondary}
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Starred messages</Text>
            <Text style={styles.optionSubtitle}>None</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction("Chat search")}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={Colors.text.secondary}
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Chat search</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => handleAction("Mute notifications")}
        >
          <Text style={styles.settingText}>Mute notifications</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => handleAction("Wallpaper & sound")}
        >
          <Text style={styles.settingText}>Wallpaper & sound</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={() => handleAction("Save to Camera Roll")}
        >
          <Text style={styles.settingText}>Save to Camera Roll</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Default</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <TouchableOpacity
          style={styles.dangerOption}
          onPress={() =>
            Alert.alert(
              "Block Contact",
              "Are you sure you want to block this contact?"
            )
          }
        >
          <Text style={styles.dangerText}>Block Sarah Johnson</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerOption}
          onPress={() =>
            Alert.alert("Report Contact", "Report this contact to WhatsApp?")
          }
        >
          <Text style={styles.dangerText}>Report Sarah Johnson</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 32,
    marginBottom: 16,
  },
  profileAvatar: {
    fontSize: 80,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  profileStatus: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  actionsSection: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    justifyContent: "space-around",
    marginBottom: 16,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  optionsSection: {
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  settingsSection: {
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  settingText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  dangerSection: {
    backgroundColor: Colors.white,
    marginBottom: 32,
  },
  dangerOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  dangerText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
});
