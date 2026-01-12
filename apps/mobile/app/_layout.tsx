import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function RootLayout() {
    const { registerForPushNotifications } = usePushNotifications();

    useEffect(() => {
        registerForPushNotifications();
    }, []);

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
