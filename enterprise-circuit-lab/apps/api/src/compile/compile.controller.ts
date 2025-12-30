import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CompileService } from './compile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('compile')
@UseGuards(JwtAuthGuard)
export class CompileController {
  constructor(private readonly compileService: CompileService) {}

  @Post()
  async createCompileJob(@Body() body: { versionId: string }, @Request() req) {
    return this.compileService.createJob(body.versionId, req.user.id);
  }

  @Get(':id')
  async getCompileJob(@Param('id') id: string) {
    return this.compileService.findById(id);
  }

  @Get('version/:versionId')
  async getVersionCompileJobs(@Param('versionId') versionId: string) {
    return this.compileService.findByVersion(versionId);
  }
}
