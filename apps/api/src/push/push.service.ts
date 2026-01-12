import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

@Injectable()
export class PushService implements OnModuleInit {
    private firebaseApp: admin.app.App | null = null;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    onModuleInit() {
        const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT');

        if (serviceAccountJson) {
            try {
                const serviceAccount = JSON.parse(serviceAccountJson);
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log('✅ Firebase Admin initialized');
            } catch (error) {
                console.error('⚠️ Failed to initialize Firebase Admin:', error);
            }
        } else {
            console.log('⚠️ Firebase service account not configured, push notifications disabled');
        }
    }

    /**
     * Send push notification to all admin devices
     */
    async notifyAdmins(payload: NotificationPayload): Promise<void> {
        if (!this.firebaseApp) {
            console.log('Push notifications disabled, skipping...');
            return;
        }

        // Get all admin devices with FCM tokens
        const devices = await this.prisma.adminDevice.findMany({
            where: {
                deviceType: { in: ['IOS', 'ANDROID'] },
            },
        });

        if (devices.length === 0) {
            return;
        }

        const tokens = devices.map((d: { deviceToken: string }) => d.deviceToken);

        try {
            const response = await admin.messaging(this.firebaseApp).sendEachForMulticast({
                tokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'chat_messages',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            });

            console.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);

            // Remove invalid tokens
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });

                if (failedTokens.length > 0) {
                    await this.prisma.adminDevice.deleteMany({
                        where: { deviceToken: { in: failedTokens } },
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }

    /**
     * Send push notification to a specific device
     */
    async notifyDevice(token: string, payload: NotificationPayload): Promise<boolean> {
        if (!this.firebaseApp) {
            return false;
        }

        try {
            await admin.messaging(this.firebaseApp).send({
                token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data,
            });
            return true;
        } catch (error) {
            console.error('Failed to send push to device:', error);
            return false;
        }
    }

    /**
     * Subscribe device to a topic
     */
    async subscribeToTopic(token: string, topic: string): Promise<void> {
        if (!this.firebaseApp) return;

        await admin.messaging(this.firebaseApp).subscribeToTopic(token, topic);
    }
}
