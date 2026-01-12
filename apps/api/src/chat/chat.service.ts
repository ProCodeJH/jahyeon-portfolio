import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // ============ CHAT MANAGEMENT ============

    async createChat(data: CreateChatDto) {
        // Check if visitor exists or create new one
        let visitor = await this.prisma.visitor.findUnique({
            where: { fingerprint: data.fingerprint },
        });

        if (!visitor) {
            visitor = await this.prisma.visitor.create({
                data: {
                    fingerprint: data.fingerprint,
                    name: data.name,
                    email: data.email,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }

        return this.prisma.chat.create({
            data: {
                visitorId: visitor.id,
                subject: data.subject,
            },
            include: {
                visitor: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    async getChat(chatId: string) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                visitor: true,
                admin: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        admin: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                        attachments: true,
                    },
                },
            },
        });

        if (!chat) {
            throw new NotFoundException('Chat not found');
        }

        return chat;
    }

    async listChats(options: {
        status?: 'WAITING' | 'ACTIVE' | 'CLOSED' | 'RESOLVED';
        adminId?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, adminId, page = 1, limit = 20 } = options;

        const where: any = {};
        if (status) where.status = status;
        if (adminId) where.adminId = adminId;

        const [chats, total] = await Promise.all([
            this.prisma.chat.findMany({
                where,
                include: {
                    visitor: true,
                    admin: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.chat.count({ where }),
        ]);

        return {
            chats,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateChat(chatId: string, data: UpdateChatDto) {
        return this.prisma.chat.update({
            where: { id: chatId },
            data: {
                ...data,
                closedAt: data.status === 'CLOSED' || data.status === 'RESOLVED' ? new Date() : undefined,
            },
            include: {
                visitor: true,
                admin: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
    }

    async assignAdmin(chatId: string, adminId: string) {
        return this.prisma.chat.update({
            where: { id: chatId },
            data: {
                adminId,
                status: 'ACTIVE',
            },
        });
    }

    // ============ MESSAGE MANAGEMENT ============

    async createMessage(data: CreateMessageDto) {
        const message = await this.prisma.message.create({
            data: {
                chatId: data.chatId,
                senderId: data.senderId,
                senderType: data.senderType,
                content: data.content,
                type: data.type || 'TEXT',
            },
            include: {
                admin: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                attachments: true,
            },
        });

        // Update chat's updatedAt
        await this.prisma.chat.update({
            where: { id: data.chatId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    async markMessagesAsRead(chatId: string, adminId: string) {
        await this.prisma.message.updateMany({
            where: {
                chatId,
                senderType: 'VISITOR',
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async getUnreadCount(adminId?: string) {
        return this.prisma.message.count({
            where: {
                senderType: 'VISITOR',
                isRead: false,
                chat: adminId ? { adminId } : { status: 'WAITING' },
            },
        });
    }

    // ============ VISITOR MANAGEMENT ============

    async blockVisitor(visitorId: string) {
        return this.prisma.visitor.update({
            where: { id: visitorId },
            data: { isBlocked: true },
        });
    }

    async unblockVisitor(visitorId: string) {
        return this.prisma.visitor.update({
            where: { id: visitorId },
            data: { isBlocked: false },
        });
    }
}
