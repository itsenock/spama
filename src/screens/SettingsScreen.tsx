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
import { currentUser } from "../data/mockData";

export default function SettingsScreen() {
  const handleSettingPress = (setting: string) => {
    Alert.alert("Coming Soon", `${setting} feature will be implemented`);
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          icon: "key-outline",
          title: "Privacy",
          subtitle: "Block contacts, disappearing messages",
        },
        {
          icon: "shield-checkmark-outline",
          title: "Security",
          subtitle: "End-to-end encryption, login verification",
        },
        {
          icon: "person-outline",
          title: "Profile",
          subtitle: "Name, about, phone number",
        },
        {
          icon: "chatbubbles-outline",
          title: "Chats",
          subtitle: "Theme, wallpapers, chat history",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          title: "Help",
          subtitle: "Help center, contact us, terms and privacy policy",
        },
        {
          icon: "people-outline",
          title: "Tell a friend",
          subtitle: "Share WhatsApp with friends",
        },
      ],
    },
    {
      title: "App Info",
      items: [
        {
          icon: "information-circle-outline",
          title: "App info",
          subtitle: "Version 2.23.20.76",
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => handleSettingPress("Profile")}
      >
        <Text style={styles.profileAvatar}>{currentUser.avatar}</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileStatus}>{currentUser.status}</Text>
        </View>
        <Ionicons name="qr-code-outline" size={24} color={Colors.secondary} />
      </TouchableOpacity>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex === section.items.length - 1 && styles.lastItem,
                ]}
                onPress={() => handleSettingPress(item.title)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={Colors.text.secondary}
                  style={styles.settingIcon}
                />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.light}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleSettingPress("Starred Messages")}
        >
          <Ionicons name="star" size={20} color={Colors.secondary} />
          <Text style={styles.quickActionText}>Starred Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleSettingPress("WhatsApp Web")}
        >
          <Ionicons name="desktop-outline" size={20} color={Colors.secondary} />
          <Text style={styles.quickActionText}>WhatsApp Web</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>WhatsApp Clone from Meta</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  profileAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.white,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    marginRight: 16,
    width: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "space-around",
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: 8,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.light,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: Colors.text.light,
  },
});
