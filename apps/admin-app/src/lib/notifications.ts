// 🔔 Push Notification Service for Jahyeon Admin App
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { saveFcmToken } from './firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Request notification permissions and get push token
export async function registerForPushNotificationsAsync(adminUid: string): Promise<string | null> {
    let token: string | null = null;

    // Check if running on a physical device
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token - permission denied');
        return null;
    }

    // Get the Expo push token
    try {
        const tokenResult = await Notifications.getExpoPushTokenAsync({
            projectId: '0aff5e28-e481-4014-8ae8-f41c2af9b5d7', // Your EAS project ID
        });
        token = tokenResult.data;
        console.log('Push token:', token);

        // Save token to Firebase
        await saveFcmToken(adminUid, token);
    } catch (error) {
        console.error('Error getting push token:', error);
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('chat-messages', {
            name: '채팅 메시지',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6366F1',
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
        });
    }

    return token;
}

// Add notification listener
export function addNotificationListener(
    onReceive: (notification: Notifications.Notification) => void,
    onResponse: (response: Notifications.NotificationResponse) => void
): () => void {
    const receivedSubscription = Notifications.addNotificationReceivedListener(onReceive);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onResponse);

    return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
    };
}

// Schedule a local notification (for testing)
export async function scheduleLocalNotification(title: string, body: string, data?: any): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: 'default',
        },
        trigger: null, // Immediate
    });
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

// Clear all notifications
export async function clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
}
