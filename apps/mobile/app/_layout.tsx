import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
    const { registerForPushNotifications } = usePushNotifications();
    const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

    // Load stored auth on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    // Register for push notifications after auth is loaded and user is authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            console.log('User authenticated, registering for push notifications...');
            registerForPushNotifications();
        }
    }, [isLoading, isAuthenticated]);

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#0a0a1a' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: '#0a0a1a' },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="chat/[id]"
                    options={{
                        title: 'Chat',
                        headerBackTitle: 'Back'
                    }}
                />
            </Stack>
        </>
    );
}

