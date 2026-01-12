import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });

        if (existingAdmin) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const admin = await this.prisma.admin.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
            },
        });

        return this.generateTokens(admin.id, dto.deviceType, dto.deviceToken);
    }

    async login(dto: LoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(admin.id, dto.deviceType, dto.deviceToken);
    }

    async refreshToken(dto: RefreshTokenDto) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { admin: true },
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Delete old refresh token
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });

        return this.generateTokens(tokenRecord.adminId, dto.deviceType, dto.deviceToken);
    }

    async logout(adminId: string, refreshToken?: string) {
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({
                where: { adminId, token: refreshToken },
            });
        } else {
            // Logout from all devices
            await this.prisma.refreshToken.deleteMany({
                where: { adminId },
            });
        }

        return { success: true };
    }

    async validateAdmin(adminId: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
            },
        });

        if (!admin) {
            throw new UnauthorizedException('Admin not found');
        }

        return admin;
    }

    async registerDevice(adminId: string, deviceToken: string, deviceType: 'WEB' | 'IOS' | 'ANDROID') {
        // Upsert device
        const existingDevice = await this.prisma.adminDevice.findFirst({
            where: { adminId, deviceToken },
        });

        if (existingDevice) {
            await this.prisma.adminDevice.update({
                where: { id: existingDevice.id },
                data: { lastActive: new Date() },
            });
            return existingDevice;
        }

        return this.prisma.adminDevice.create({
            data: {
                adminId,
                deviceToken,
                deviceType,
            },
        });
    }

    private async generateTokens(
        adminId: string,
        deviceType?: 'WEB' | 'IOS' | 'ANDROID',
        deviceToken?: string,
    ) {
        const payload = { sub: adminId };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = randomBytes(64).toString('hex');

        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                adminId,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Register device if provided
        if (deviceType && deviceToken) {
            await this.registerDevice(adminId, deviceToken, deviceType);
        }

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }
}
