import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);

        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Error', 'Invalid email or password');
        }
    };

    return (
        <View style={styles.container}>
            {/* Background gradient effect */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />

            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Jahyeon</Text>
                    <Text style={styles.logoSubtext}>Admin</Text>
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to manage your platform</Text>

                {/* Form */}
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    gradientTop: {
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: 200,
        height: 200,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderRadius: 100,
    },
    gradientBottom: {
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: 150,
        height: 150,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderRadius: 75,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#8b5cf6',
    },
    logoSubtext: {
        fontSize: 18,
        color: '#06b6d4',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 48,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    button: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
