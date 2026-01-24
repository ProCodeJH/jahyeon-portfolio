import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateChatDto {
    @IsString()
    fingerprint: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsOptional()
    @IsString()
    userAgent?: string;
}

export class UpdateChatDto {
    @IsOptional()
    @IsEnum(['WAITING', 'ACTIVE', 'CLOSED', 'RESOLVED'])
    status?: 'WAITING' | 'ACTIVE' | 'CLOSED' | 'RESOLVED';

    @IsOptional()
    @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

    @IsOptional()
    @IsString()
    adminId?: string;
}

export class CreateMessageDto {
    @IsString()
    chatId: string;

    @IsOptional()
    @IsString()
    senderId?: string | null;

    @IsEnum(['VISITOR', 'ADMIN', 'SYSTEM'])
    senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';

    @IsString()
    content: string;

    @IsOptional()
    @IsEnum(['TEXT', 'IMAGE', 'FILE', 'EMOJI', 'SYSTEM'])
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'EMOJI' | 'SYSTEM';
}
