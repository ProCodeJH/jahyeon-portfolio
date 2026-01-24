import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis | null = null;
    private readonly logger = new Logger(RedisService.name);
    private connected = false;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('Redis URL not configured, running without Redis');
            return;
        }

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3) {
                        this.logger.warn('Redis connection failed, running without Redis');
                        return null;
                    }
                    return Math.min(times * 100, 3000);
                },
                lazyConnect: true,
            });

            this.client.on('error', (err) => {
                if (this.connected) {
                    this.logger.error('Redis connection error', err.message);
                }
            });

            this.client.on('connect', () => {
                this.connected = true;
                this.logger.log('Redis connected successfully');
            });

            await this.client.connect();
        } catch (error) {
            this.logger.warn('Redis connection failed, running without Redis');
            this.client = null;
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    getClient(): Redis | null {
        return this.client;
    }

    // User presence tracking
    async setOnline(userId: string, socketId: string): Promise<void> {
        if (!this.client) return;
        await this.client.hset('online_users', userId, socketId);
        await this.client.expire('online_users', 86400);
    }

    async setOffline(userId: string): Promise<void> {
        if (!this.client) return;
        await this.client.hdel('online_users', userId);
    }

    async getOnlineUsers(): Promise<Record<string, string>> {
        if (!this.client) return {};
        return this.client.hgetall('online_users');
    }

    async isOnline(userId: string): Promise<boolean> {
        if (!this.client) return false;
        const result = await this.client.hget('online_users', userId);
        return !!result;
    }

    async setTyping(chatId: string, senderId: string): Promise<void> {
        if (!this.client) return;
        await this.client.setex(`typing:${chatId}`, 5, senderId);
    }

    async getTyping(chatId: string): Promise<string | null> {
        if (!this.client) return null;
        return this.client.get(`typing:${chatId}`);
    }

    async addAdminToChat(chatId: string, adminId: string): Promise<void> {
        if (!this.client) return;
        await this.client.sadd(`chat:${chatId}:admins`, adminId);
    }

    async getAdminsInChat(chatId: string): Promise<string[]> {
        if (!this.client) return [];
        return this.client.smembers(`chat:${chatId}:admins`);
    }

    async publish(channel: string, message: string): Promise<void> {
        if (!this.client) return;
        await this.client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        if (!this.client) return;
        const subscriber = this.client.duplicate();
        await subscriber.subscribe(channel);
        subscriber.on('message', (_, message) => callback(message));
    }
}
