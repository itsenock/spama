import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  // Register for push notifications
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push notification token:", token);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  // Update user's FCM token in Firestore
  static async updateUserToken(userId: string, token: string): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        fcmToken: token,
      });
    } catch (error) {
      console.error("Error updating FCM token:", error);
    }
  }

  // Show local notification
  static async showLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error showing local notification:", error);
    }
  }

  // Listen for incoming notifications
  static addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Listen for notification responses (when user taps notification)
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Get notification permissions status
  static async getPermissionStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Set badge count
  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // Clear badge
  static async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // Schedule notification for later
  static async scheduleNotification(
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger: { seconds },
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  // Handle notification when app is in background/foreground
  static handleNotification(
    notification: Notifications.Notification,
    onMessageReceived: (chatId: string, senderId: string) => void
  ) {
    const { data } = notification.request.content;

    if (data?.type === "message" && data?.chatId && data?.senderId) {
      onMessageReceived(data.chatId, data.senderId);
    }
  }

  // Handle notification response when user taps notification
  static handleNotificationResponse(
    response: Notifications.NotificationResponse,
    navigation: any
  ) {
    const { data } = response.notification.request.content;

    if (data?.type === "message" && data?.chatId) {
      // Navigate to chat screen
      navigation.navigate("Chat", {
        chatId: data.chatId,
        chatName: data.chatName || "Chat",
        avatar: data.avatar || "👤",
      });
    }
  }

  // Send push notification to specific user (would be handled by backend)
  static async sendPushNotification(
    targetToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      // This would typically be done by your backend server
      // Using Expo's push notification service
      const message = {
        to: targetToken,
        sound: "default",
        title,
        body,
        data,
        badge: 1,
      };

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return result.data?.status === "ok";
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }

  // Create notification categories (for iOS)
  static async createNotificationCategories() {
    if (Platform.OS === "ios") {
      await Notifications.setNotificationCategoryAsync("message", [
        {
          identifier: "reply",
          buttonTitle: "Reply",
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: "mark_read",
          buttonTitle: "Mark as Read",
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  }

  // Format notification for message
  static formatMessageNotification(
    senderName: string,
    messageText: string,
    isGroup: boolean = false
  ) {
    return {
      title: senderName,
      body: isGroup ? `${senderName}: ${messageText}` : messageText,
      data: {
        type: "message",
        timestamp: Date.now(),
      },
    };
  }

  // Format notification for call
  static formatCallNotification(
    callerName: string,
    callType: "audio" | "video"
  ) {
    return {
      title: `${callType === "video" ? "Video" : "Audio"} Call`,
      body: `${callerName} is calling...`,
      data: {
        type: "call",
        callType,
        timestamp: Date.now(),
      },
    };
  }

  // Get all pending notifications
  static async getPendingNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Cancel specific notification
  static async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
