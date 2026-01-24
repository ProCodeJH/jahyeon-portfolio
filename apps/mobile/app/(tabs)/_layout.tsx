import { Tabs } from 'expo-router';
import { MessageCircle, FileText, Settings, User } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#8b5cf6',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#0f0f1a',
                    borderTopColor: 'rgba(255, 255, 255, 0.1)',
                    borderTopWidth: 1,
                    height: 80,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                headerStyle: {
                    backgroundColor: '#0a0a1a',
                },
                headerTintColor: '#fff',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color, size }) => (
                        <MessageCircle color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="blog"
                options={{
                    title: 'Blog',
                    tabBarIcon: ({ color, size }) => (
                        <FileText color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <User color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
