// 🚀 Jahyeon Admin App - Main Entry
// Ultra-Premium Mobile Chat Management Application

import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatRoomScreen } from './src/screens/ChatRoomScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Store & Firebase
import { useAuthStore, useChatStore, useThemeStore } from './src/lib/store';
import { onAdminAuthStateChanged } from './src/lib/firebase';
import { Colors, Gradients } from './src/styles/colors';

// Type definitions
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

type TabParamList = {
  Chats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar Icons
function ChatIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <View style={styles.chatIconBody}>
        <View style={[styles.chatIconDot, focused && styles.chatIconDotFocused]} />
        <View style={[styles.chatIconDot, focused && styles.chatIconDotFocused]} />
        <View style={[styles.chatIconDot, focused && styles.chatIconDotFocused]} />
      </View>
    </View>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <View style={[styles.settingsIconOuter, focused && styles.settingsIconFocused]}>
        <View style={[styles.settingsIconInner, focused && styles.settingsIconInnerFocused]} />
      </View>
    </View>
  );
}

// Tab Navigator
function MainTabs() {
  const { mode } = useThemeStore();
  const { totalUnread } = useChatStore();
  const isDark = mode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleLogout = () => {
    // Will be handled by auth state change
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0F0F23' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderTopWidth: 1,
          height: 90,
          paddingTop: 10,
          paddingBottom: 30,
        },
        tabBarActiveTintColor: Colors.primary.start,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ focused }) => <ChatIcon focused={focused} />,
          tabBarBadge: totalUnread > 0 ? (totalUnread > 99 ? '99+' : totalUnread) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary.start,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} />,
        }}
      >
        {() => <SettingsScreen onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.dark.background }]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={Gradients.primary as [string, string]}
          style={styles.loadingLogo}
        >
          <View style={styles.loadingLogoText}>
            <View style={styles.loadingJ} />
            <View style={styles.loadingH} />
          </View>
        </LinearGradient>
        <ActivityIndicator
          size="large"
          color={Colors.primary.start}
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth">
              {() => <LoginScreen onLoginSuccess={() => { }} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="ChatRoom"
                component={ChatRoomScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingJ: {
    width: 20,
    height: 30,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 10,
  },
  loadingH: {
    width: 20,
    height: 30,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    marginLeft: 4,
  },
  loadingSpinner: {
    marginTop: 24,
  },
  tabIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  chatIconBody: {
    width: 24,
    height: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.textMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  chatIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dark.textMuted,
  },
  chatIconDotFocused: {
    backgroundColor: Colors.primary.start,
  },
  settingsIconOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconFocused: {
    borderColor: Colors.primary.start,
  },
  settingsIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.textMuted,
  },
  settingsIconInnerFocused: {
    backgroundColor: Colors.primary.start,
  },
});
