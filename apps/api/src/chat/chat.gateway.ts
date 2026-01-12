import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { PushService } from '../push/push.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userType?: 'admin' | 'visitor';
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtService: JwtService,
        private chatService: ChatService,
        private redisService: RedisService,
        private pushService: PushService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract token from query or auth header
            const token = client.handshake.query.token as string;

            if (token) {
                // Admin connection with JWT
                const payload = this.jwtService.verify(token);
                client.userId = payload.sub;
                client.userType = 'admin';

                // Track online status
                if (client.userId) {
                    await this.redisService.setOnline(client.userId, client.id);
                }

                // Join admin room
                client.join('admins');

                // Broadcast admin online status
                this.server.emit('admin:online', { adminId: client.userId });
            } else {
                // Visitor connection (anonymous)
                const visitorId = client.handshake.query.visitorId as string;
                if (visitorId) {
                    client.userId = visitorId;
                    client.userType = 'visitor';

                    // Track visitor online status
                    await this.redisService.setOnline(visitorId, client.id);
                }
            }

            console.log(`Client connected: ${client.id} (${client.userType})`);
        } catch (error) {
            console.error('Connection error:', error);
            client.disconnect();
        }
    }

    async handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            await this.redisService.setOffline(client.userId);

            if (client.userType === 'admin') {
                this.server.emit('admin:offline', { adminId: client.userId });
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('chat:join')
    async handleJoinChat(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string },
    ) {
        client.join(`chat:${data.chatId}`);

        // Mark messages as read if admin
        if (client.userType === 'admin' && client.userId) {
            await this.chatService.markMessagesAsRead(data.chatId, client.userId);
            this.server.to(`chat:${data.chatId}`).emit('chat:read', {
                chatId: data.chatId,
                readBy: client.userId,
            });
        }
    }

    @SubscribeMessage('chat:leave')
    async handleLeaveChat(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string },
    ) {
        client.leave(`chat:${data.chatId}`);
    }

    @SubscribeMessage('chat:message')
    async handleMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string; content: string; type?: string },
    ) {
        if (!client.userId) return;

        const message = await this.chatService.createMessage({
            chatId: data.chatId,
            senderId: client.userType === 'admin' ? client.userId : null,
            senderType: client.userType === 'admin' ? 'ADMIN' : 'VISITOR',
            content: data.content,
            type: (data.type as any) || 'TEXT',
        });

        // Broadcast to chat room
        this.server.to(`chat:${data.chatId}`).emit('chat:message', message);

        // If visitor sent message, notify all admins
        if (client.userType === 'visitor') {
            this.server.to('admins').emit('chat:new-message', {
                chatId: data.chatId,
                message,
            });

            // Send push notification to all admin devices
            await this.pushService.notifyAdmins({
                title: 'New Message',
                body: data.content.substring(0, 100),
                data: { chatId: data.chatId },
            });
        }
    }

    @SubscribeMessage('chat:typing')
    async handleTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string },
    ) {
        if (!client.userId) return;

        await this.redisService.setTyping(data.chatId, client.userId);

        // Broadcast typing indicator
        client.to(`chat:${data.chatId}`).emit('chat:typing', {
            chatId: data.chatId,
            userId: client.userId,
            userType: client.userType,
        });
    }

    @SubscribeMessage('chat:stop-typing')
    handleStopTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { chatId: string },
    ) {
        client.to(`chat:${data.chatId}`).emit('chat:stop-typing', {
            chatId: data.chatId,
            userId: client.userId,
        });
    }
}
