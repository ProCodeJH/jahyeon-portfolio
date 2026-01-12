import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
export class ChatController {
    constructor(private chatService: ChatService) { }

    // Public - visitors can create chats
    @Post()
    createChat(@Body() dto: CreateChatDto) {
        return this.chatService.createChat(dto);
    }

    // Protected - admins only
    @UseGuards(JwtAuthGuard)
    @Get()
    listChats(
        @Query('status') status?: 'WAITING' | 'ACTIVE' | 'CLOSED' | 'RESOLVED',
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.chatService.listChats({ status, page, limit });
    }

    @UseGuards(JwtAuthGuard)
    @Get('unread-count')
    getUnreadCount(@Req() req: any) {
        return this.chatService.getUnreadCount(req.user.id);
    }

    @Get(':id')
    getChat(@Param('id') id: string) {
        return this.chatService.getChat(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    updateChat(@Param('id') id: string, @Body() dto: UpdateChatDto) {
        return this.chatService.updateChat(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/assign')
    assignChat(@Param('id') id: string, @Req() req: any) {
        return this.chatService.assignAdmin(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('visitors/:id/block')
    blockVisitor(@Param('id') id: string) {
        return this.chatService.blockVisitor(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('visitors/:id/unblock')
    unblockVisitor(@Param('id') id: string) {
        return this.chatService.unblockVisitor(id);
    }
}
