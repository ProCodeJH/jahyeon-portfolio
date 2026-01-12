import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;

    constructor(private configService: ConfigService) {
        this.client = new Redis(
            this.configService.get('REDIS_URL') || 'redis://localhost:6379',
        );
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }

    // User presence tracking
    async setOnline(userId: string, socketId: string): Promise<void> {
        await this.client.hset('online_users', userId, socketId);
        await this.client.expire('online_users', 86400); // 24 hours
    }

    async setOffline(userId: string): Promise<void> {
        await this.client.hdel('online_users', userId);
    }

    async getOnlineUsers(): Promise<Record<string, string>> {
        return this.client.hgetall('online_users');
    }

    async isOnline(userId: string): Promise<boolean> {
        const result = await this.client.hget('online_users', userId);
        return !!result;
    }

    // Typing indicators
    async setTyping(chatId: string, senderId: string): Promise<void> {
        const key = `typing:${chatId}`;
        await this.client.setex(key, 5, senderId); // Expires in 5 seconds
    }

    async getTyping(chatId: string): Promise<string | null> {
        return this.client.get(`typing:${chatId}`);
    }

    // Chat session management
    async addAdminToChat(chatId: string, adminId: string): Promise<void> {
        await this.client.sadd(`chat:${chatId}:admins`, adminId);
    }

    async getAdminsInChat(chatId: string): Promise<string[]> {
        return this.client.smembers(`chat:${chatId}:admins`);
    }

    // Generic pub/sub
    async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        const subscriber = this.client.duplicate();
        await subscriber.subscribe(channel);
        subscriber.on('message', (_, message) => callback(message));
    }
}
