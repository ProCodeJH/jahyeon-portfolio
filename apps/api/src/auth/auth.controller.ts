import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('devices')
    async registerDevice(
        @Req() req: any,
        @Body() body: { deviceToken: string; deviceType: 'WEB' | 'IOS' | 'ANDROID' },
    ) {
        return this.authService.registerDevice(
            req.user.id,
            body.deviceToken,
            body.deviceType,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: any, @Body('refreshToken') refreshToken?: string) {
        return this.authService.logout(req.user.id, refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: any) {
        return this.authService.validateAdmin(req.user.id);
    }
}
