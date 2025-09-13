import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Alert } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ChatScreenFirebase from './src/screens/ChatScreenFirebase';
import ContactInfoScreen from './src/screens/ContactInfoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import { RootStackParamList } from './src/types';
import { Colors } from './src/constants/Colors';
import { NotificationService } from './src/services/notificationService';

const Stack = createStackNavigator<RootStackParamList>();

function AuthNavigator() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background.default} />
      {showLogin ? (
        <LoginScreen onSwitchToSignUp={() => setShowLogin(false)} />
      ) : (
        <SignUpScreen onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </>
  );
}

function AppNavigator() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreenFirebase} 
          options={({ route }) => ({ 
            title: route.params.chatName,
            headerBackTitleVisible: false,
          })}
        />
        <Stack.Screen 
          name="ContactInfo" 
          component={ContactInfoScreen} 
          options={{ title: 'Contact Info' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [notificationToken, setNotificationToken] = useState<string | null>(null);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Register for push notifications
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        setNotificationToken(token);
        // Update user's FCM token in Firestore
        await NotificationService.updateUserToken(user!.id, token);
      }

      // Create notification categories
      await NotificationService.createNotificationCategories();

      // Listen for incoming notifications
      const notificationListener = NotificationService.addNotificationListener(
        (notification) => {
          console.log('Notification received:', notification);
          // Handle notification when app is in foreground
          NotificationService.handleNotification(
            notification,
            (chatId, senderId) => {
              console.log('New message in chat:', chatId, 'from:', senderId);
              // You can show an in-app notification or update UI
            }
          );
        }
      );

      // Listen for notification responses (when user taps notification)
      const responseListener = NotificationService.addNotificationResponseListener(
        (response) => {
          console.log('Notification response:', response);
          // This would handle navigation when user taps notification
          // NotificationService.handleNotificationResponse(response, navigation);
        }
      );

      // Cleanup listeners
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    } catch (error) {
      console.error('Notification initialization error:', error);
      Alert.alert(
        'Notifications', 
        'Failed to initialize push notifications. You may not receive message alerts.'
      );
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.background.default 
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show appropriate navigator based on authentication state
  return user ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources, fonts, etc.
        // This is where you'd load custom fonts, cache images, etc.
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.primary 
      }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}