import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(['WEB', 'IOS', 'ANDROID'])
    deviceType?: 'WEB' | 'IOS' | 'ANDROID';

    @IsOptional()
    @IsString()
    deviceToken?: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsEnum(['WEB', 'IOS', 'ANDROID'])
    deviceType?: 'WEB' | 'IOS' | 'ANDROID';

    @IsOptional()
    @IsString()
    deviceToken?: string;
}

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;

    @IsOptional()
    @IsEnum(['WEB', 'IOS', 'ANDROID'])
    deviceType?: 'WEB' | 'IOS' | 'ANDROID';

    @IsOptional()
    @IsString()
    deviceToken?: string;
}
