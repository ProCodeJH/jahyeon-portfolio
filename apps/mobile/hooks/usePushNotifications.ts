import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    const registerForPushNotifications = async () => {
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification');
            return;
        }

        // Get Expo push token
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Replace with your Expo project ID
        });

        setExpoPushToken(token.data);

        // Configure for Android
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('chat_messages', {
                name: 'Chat Messages',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#8b5cf6',
            });
        }

        return token.data;
    };

    const registerDeviceToken = async (fcmToken: string) => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;

        try {
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    deviceToken: fcmToken,
                    deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
                }),
            });
        } catch (error) {
            console.error('Failed to register device:', error);
        }
    };

    useEffect(() => {
        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('Notification received:', notification);
            }
        );

        // Listen for notification responses (when user taps)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                if (data.chatId) {
                    // Navigate to chat - handled by expo-router
                    // router.push(`/chat/${data.chatId}`);
                }
            }
        );

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return {
        expoPushToken,
        registerForPushNotifications,
        registerDeviceToken,
    };
}
