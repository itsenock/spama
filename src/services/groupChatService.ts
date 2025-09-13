import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Chat, User, Message } from "../types";

export class GroupChatService {
  // Create a new group chat
  static async createGroup(
    creatorId: string,
    name: string,
    description: string,
    participants: string[],
    avatarUri?: string
  ): Promise<string> {
    try {
      // Upload group avatar if provided
      let avatarUrl = "";
      if (avatarUri) {
        avatarUrl = await this.uploadGroupAvatar(avatarUri);
      }

      // Create group document
      const groupRef = doc(collection(db, "chats"));
      const groupId = groupRef.id;

      // Initialize unread counts for all participants
      const unreadCount: { [key: string]: number } = {};
      participants.forEach((participantId) => {
        unreadCount[participantId] = 0;
      });

      const groupData: Partial<Chat> = {
        id: groupId,
        type: "group",
        name,
        description,
        participants,
        admins: [creatorId],
        createdBy: creatorId,
        unreadCount,
        avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          disappearingMessages: 0, // Disabled by default
        },
      };

      await setDoc(groupRef, {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send system message about group creation
      await this.sendSystemMessage(
        groupId,
        `${creatorId} created the group`,
        "group_created"
      );

      return groupId;
    } catch (error) {
      console.error("Create group error:", error);
      throw error;
    }
  }

  // Upload group avatar
  static async uploadGroupAvatar(avatarUri: string): Promise<string> {
    try {
      const response = await fetch(avatarUri);
      const blob = await response.blob();

      const filename = `group_avatar_${Date.now()}.jpg`;
      const storageRef = ref(storage, `avatars/groups/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Upload group avatar error:", error);
      throw error;
    }
  }

  // Add members to group
  static async addMembersToGroup(
    groupId: string,
    newMemberIds: string[],
    addedBy: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is admin
      if (!groupData.admins?.includes(addedBy)) {
        throw new Error("Only admins can add members");
      }

      // Filter out members who are already in the group
      const membersToAdd = newMemberIds.filter(
        (memberId) => !groupData.participants.includes(memberId)
      );

      if (membersToAdd.length === 0) {
        return;
      }

      // Update group participants
      await updateDoc(groupRef, {
        participants: arrayUnion(...membersToAdd),
        updatedAt: serverTimestamp(),
      });

      // Initialize unread count for new members
      const updates: { [key: string]: number } = {};
      membersToAdd.forEach((memberId) => {
        updates[`unreadCount.${memberId}`] = 0;
      });
      await updateDoc(groupRef, updates);

      // Send system messages for each added member
      for (const memberId of membersToAdd) {
        await this.sendSystemMessage(
          groupId,
          `${addedBy} added ${memberId} to the group`,
          "member_added"
        );
      }
    } catch (error) {
      console.error("Add members error:", error);
      throw error;
    }
  }

  // Remove member from group
  static async removeMemberFromGroup(
    groupId: string,
    memberIdToRemove: string,
    removedBy: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is admin or removing themselves
      if (
        !groupData.admins?.includes(removedBy) &&
        removedBy !== memberIdToRemove
      ) {
        throw new Error("Only admins can remove members");
      }

      // Remove member from participants and admins
      await updateDoc(groupRef, {
        participants: arrayRemove(memberIdToRemove),
        admins: arrayRemove(memberIdToRemove),
        updatedAt: serverTimestamp(),
      });

      // Remove member's unread count
      const updates: { [key: string]: any } = {};
      updates[`unreadCount.${memberIdToRemove}`] = null;
      await updateDoc(groupRef, updates);

      // Send system message
      const actionText =
        removedBy === memberIdToRemove ? "left" : "was removed from";
      await this.sendSystemMessage(
        groupId,
        `${memberIdToRemove} ${actionText} the group`,
        "member_removed"
      );
    } catch (error) {
      console.error("Remove member error:", error);
      throw error;
    }
  }

  // Make member admin
  static async makeAdmin(
    groupId: string,
    memberIdToPromote: string,
    promotedBy: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is admin
      if (!groupData.admins?.includes(promotedBy)) {
        throw new Error("Only admins can promote members");
      }

      // Check if member is in the group
      if (!groupData.participants.includes(memberIdToPromote)) {
        throw new Error("User is not a member of this group");
      }

      // Add to admins if not already admin
      if (!groupData.admins.includes(memberIdToPromote)) {
        await updateDoc(groupRef, {
          admins: arrayUnion(memberIdToPromote),
          updatedAt: serverTimestamp(),
        });

        await this.sendSystemMessage(
          groupId,
          `${memberIdToPromote} is now an admin`,
          "admin_promoted"
        );
      }
    } catch (error) {
      console.error("Make admin error:", error);
      throw error;
    }
  }

  // Remove admin privileges
  static async removeAdmin(
    groupId: string,
    adminIdToRemove: string,
    removedBy: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is admin
      if (!groupData.admins?.includes(removedBy)) {
        throw new Error("Only admins can remove admin privileges");
      }

      // Can't remove creator's admin privileges
      if (adminIdToRemove === groupData.createdBy) {
        throw new Error("Cannot remove admin privileges from group creator");
      }

      await updateDoc(groupRef, {
        admins: arrayRemove(adminIdToRemove),
        updatedAt: serverTimestamp(),
      });

      await this.sendSystemMessage(
        groupId,
        `${adminIdToRemove} is no longer an admin`,
        "admin_removed"
      );
    } catch (error) {
      console.error("Remove admin error:", error);
      throw error;
    }
  }

  // Update group info
  static async updateGroupInfo(
    groupId: string,
    updates: {
      name?: string;
      description?: string;
      avatarUri?: string;
    },
    updatedBy: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is admin
      if (!groupData.admins?.includes(updatedBy)) {
        throw new Error("Only admins can update group info");
      }

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (updates.name) {
        updateData.name = updates.name;
      }

      if (updates.description) {
        updateData.description = updates.description;
      }

      if (updates.avatarUri) {
        const avatarUrl = await this.uploadGroupAvatar(updates.avatarUri);
        updateData.avatarUrl = avatarUrl;
      }

      await updateDoc(groupRef, updateData);

      // Send system message about group update
      let changeText = "";
      if (updates.name) changeText += "name";
      if (updates.description)
        changeText += changeText ? ", description" : "description";
      if (updates.avatarUri) changeText += changeText ? ", photo" : "photo";

      await this.sendSystemMessage(
        groupId,
        `${updatedBy} updated the group ${changeText}`,
        "group_updated"
      );
    } catch (error) {
      console.error("Update group info error:", error);
      throw error;
    }
  }

  // Leave group
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      await this.removeMemberFromGroup(groupId, userId, userId);
    } catch (error) {
      console.error("Leave group error:", error);
      throw error;
    }
  }

  // Delete group (only creator can do this)
  static async deleteGroup(groupId: string, deletedBy: string): Promise<void> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;

      // Check if user is the creator
      if (groupData.createdBy !== deletedBy) {
        throw new Error("Only group creator can delete the group");
      }

      // Delete all messages in the group
      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", groupId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete the group
      await deleteDoc(groupRef);
    } catch (error) {
      console.error("Delete group error:", error);
      throw error;
    }
  }

  // Send system message
  static async sendSystemMessage(
    groupId: string,
    messageText: string,
    systemMessageType: string
  ): Promise<void> {
    try {
      const messageData: Partial<Message> = {
        text: messageText,
        senderId: "system",
        chatId: groupId,
        type: "text",
        status: "sent",
        timestamp: new Date(),
        systemMessageType,
      };

      await addDoc(collection(db, "messages"), {
        ...messageData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Send system message error:", error);
    }
  }

  // Get group members
  static async getGroupMembers(groupId: string): Promise<User[]> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data() as Chat;
      const members: User[] = [];

      // Fetch user data for each participant
      for (const participantId of groupData.participants) {
        const userDoc = await getDoc(doc(db, "users", participantId));
        if (userDoc.exists()) {
          members.push(userDoc.data() as User);
        }
      }

      return members;
    } catch (error) {
      console.error("Get group members error:", error);
      throw error;
    }
  }

  // Subscribe to group changes
  static subscribeToGroup(groupId: string, callback: (group: Chat) => void) {
    const groupRef = doc(db, "chats", groupId);

    return onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Chat);
      }
    });
  }

  // Check if user is admin
  static async isUserAdmin(groupId: string, userId: string): Promise<boolean> {
    try {
      const groupRef = doc(db, "chats", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        return false;
      }

      const groupData = groupDoc.data() as Chat;
      return groupData.admins?.includes(userId) || false;
    } catch (error) {
      console.error("Check admin status error:", error);
      return false;
    }
  }
}
