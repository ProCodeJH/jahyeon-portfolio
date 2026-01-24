import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    // ============ POSTS ============

    async createPost(authorId: string, data: CreatePostDto) {
        const slug = this.generateSlug(data.title);

        return this.prisma.blogPost.create({
            data: {
                authorId,
                title: data.title,
                slug,
                content: data.content,
                excerpt: data.excerpt,
                coverImage: data.coverImage,
                categoryId: data.categoryId,
                seoTitle: data.seoTitle,
                seoDesc: data.seoDesc,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                category: true,
                tags: true,
            },
        });
    }

    async updatePost(id: string, data: UpdatePostDto) {
        const post = await this.prisma.blogPost.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');

        const updateData: any = { ...data };

        // Update slug if title changed
        if (data.title && data.title !== post.title) {
            updateData.slug = this.generateSlug(data.title);
        }

        // Set publishedAt if status changed to PUBLISHED
        if (data.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }

        return this.prisma.blogPost.update({
            where: { id },
            data: updateData,
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                category: true,
                tags: true,
            },
        });
    }

    async deletePost(id: string) {
        await this.prisma.blogPost.delete({ where: { id } });
        return { success: true };
    }

    async getPost(identifier: string) {
        const post = await this.prisma.blogPost.findFirst({
            where: {
                OR: [{ id: identifier }, { slug: identifier }],
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                category: true,
                tags: true,
                comments: {
                    where: { approved: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!post) throw new NotFoundException('Post not found');

        // Increment view count
        await this.prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        });

        return post;
    }

    async listPosts(options: {
        status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
        categoryId?: string;
        authorId?: string;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const { status, categoryId, authorId, page = 1, limit = 10, search } = options;

        const where: any = {};
        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;
        if (authorId) where.authorId = authorId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, avatarUrl: true } },
                    category: true,
                    tags: true,
                    _count: { select: { comments: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.blogPost.count({ where }),
        ]);

        return {
            posts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    // ============ CATEGORIES ============

    async createCategory(name: string) {
        const slug = this.generateSlug(name);
        return this.prisma.blogCategory.create({ data: { name, slug } });
    }

    async listCategories() {
        return this.prisma.blogCategory.findMany({
            include: { _count: { select: { posts: true } } },
        });
    }

    // ============ COMMENTS ============

    async createComment(postId: string, data: CreateCommentDto) {
        return this.prisma.blogComment.create({
            data: {
                postId,
                author: data.author,
                email: data.email,
                content: data.content,
            },
        });
    }

    async approveComment(id: string) {
        return this.prisma.blogComment.update({
            where: { id },
            data: { approved: true },
        });
    }

    async deleteComment(id: string) {
        await this.prisma.blogComment.delete({ where: { id } });
        return { success: true };
    }

    async listPendingComments() {
        return this.prisma.blogComment.findMany({
            where: { approved: false },
            include: {
                post: { select: { id: true, title: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ============ HELPERS ============

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100) + '-' + Date.now().toString(36);
    }
}
