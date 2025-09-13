import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Chat, User, RootStackParamList } from "../types";
import { Colors } from "../constants/Colors";
import { formatChatTime, truncateText } from "../utils/helpers";
import { mockChats, mockUsers, currentUser } from "../data/mockData";
import ChatItem from "../components/ChatItem";

type NavigationProp = StackNavigationProp<RootStackParamList, "Main">;

export default function ChatsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const chatName = getChatName(chat);
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatName = (chat: Chat): string => {
    if (chat.type === "group") {
      return chat.name || "Group";
    }

    const otherUserId = chat.participants.find((id) => id !== currentUser.id);
    const otherUser = mockUsers.find((user) => user.id === otherUserId);
    return otherUser?.name || "Unknown";
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === "group") {
      return chat.avatar || "👥";
    }

    const otherUserId = chat.participants.find((id) => id !== currentUser.id);
    const otherUser = mockUsers.find((user) => user.id === otherUserId);
    return otherUser?.avatar || "👤";
  };

  const getOtherUser = (chat: Chat): User | undefined => {
    const otherUserId = chat.participants.find((id) => id !== currentUser.id);
    return mockUsers.find((user) => user.id === otherUserId);
  };

  const handleChatPress = (chat: Chat) => {
    const chatName = getChatName(chat);
    const avatar = getChatAvatar(chat);

    navigation.navigate("Chat", {
      chatId: chat.id,
      chatName,
      avatar,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <ChatItem
      chat={item}
      chatName={getChatName(item)}
      avatar={getChatAvatar(item)}
      otherUser={getOtherUser(item)}
      onPress={() => handleChatPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.gray[400]}
        />
        {isSearching && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray[400]} />
      <Text style={styles.emptyText}>No chats yet</Text>
      <Text style={styles.emptySubtext}>
        Start a conversation with your contacts
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={
          filteredChats.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            "Coming Soon",
            "Contact selection screen will be implemented"
          )
        }
      >
        <Ionicons name="chatbubble" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    backgroundColor: Colors.background.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyList: {
    flex: 1,
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: Colors.secondary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
