import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
    constructor(private blogService: BlogService) { }

    // ============ POSTS ============

    @UseGuards(JwtAuthGuard)
    @Post('posts')
    createPost(@Req() req: any, @Body() dto: CreatePostDto) {
        return this.blogService.createPost(req.user.id, dto);
    }

    @Get('posts')
    listPosts(
        @Query('status') status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED',
        @Query('categoryId') categoryId?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        // Only show published posts to public
        const finalStatus = status || 'PUBLISHED';
        return this.blogService.listPosts({ status: finalStatus, categoryId, page, limit, search });
    }

    @UseGuards(JwtAuthGuard)
    @Get('posts/all')
    listAllPosts(
        @Query('status') status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED',
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Req() req?: any,
    ) {
        return this.blogService.listPosts({ status, authorId: req?.user?.id, page, limit });
    }

    @Get('posts/:identifier')
    getPost(@Param('identifier') identifier: string) {
        return this.blogService.getPost(identifier);
    }

    @UseGuards(JwtAuthGuard)
    @Put('posts/:id')
    updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.blogService.updatePost(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('posts/:id')
    deletePost(@Param('id') id: string) {
        return this.blogService.deletePost(id);
    }

    // ============ CATEGORIES ============

    @Get('categories')
    listCategories() {
        return this.blogService.listCategories();
    }

    @UseGuards(JwtAuthGuard)
    @Post('categories')
    createCategory(@Body('name') name: string) {
        return this.blogService.createCategory(name);
    }

    // ============ COMMENTS ============

    @Post('posts/:postId/comments')
    createComment(@Param('postId') postId: string, @Body() dto: CreateCommentDto) {
        return this.blogService.createComment(postId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('comments/pending')
    listPendingComments() {
        return this.blogService.listPendingComments();
    }

    @UseGuards(JwtAuthGuard)
    @Post('comments/:id/approve')
    approveComment(@Param('id') id: string) {
        return this.blogService.approveComment(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('comments/:id')
    deleteComment(@Param('id') id: string) {
        return this.blogService.deleteComment(id);
    }
}
