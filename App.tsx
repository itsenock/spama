import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainTabNavigator from "./src/navigation/MainTabNavigator";
import ChatScreen from "./src/screens/ChatScreen";
import ContactInfoScreen from "./src/screens/ContactInfoScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { RootStackParamList } from "./src/types";
import { Colors } from "./src/constants/Colors";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontWeight: "bold",
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
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params.chatName,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="ContactInfo"
            component={ContactInfoScreen}
            options={{ title: "Contact Info" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Settings" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
