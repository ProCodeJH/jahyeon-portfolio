import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    seoTitle?: string;

    @IsOptional()
    @IsString()
    seoDesc?: string;

    @IsOptional()
    @IsEnum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED'])
    status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
}

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    seoTitle?: string;

    @IsOptional()
    @IsString()
    seoDesc?: string;

    @IsOptional()
    @IsEnum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED'])
    status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
}

export class CreateCommentDto {
    @IsString()
    author: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsString()
    content: string;
}
