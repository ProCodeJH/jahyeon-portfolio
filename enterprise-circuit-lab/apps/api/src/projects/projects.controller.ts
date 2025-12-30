import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getProjects(@Query('orgId') orgId: string, @Request() req) {
    if (!orgId) {
      return { error: 'orgId query parameter is required' };
    }
    return this.projectsService.findByOrg(orgId, req.user.id);
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req) {
    return this.projectsService.findById(id);
  }

  @Post()
  async createProject(@Body() body: any, @Request() req) {
    return this.projectsService.create(req.user.id, body.orgId, body);
  }

  @Patch(':id')
  async updateProject(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.projectsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req) {
    await this.projectsService.delete(id, req.user.id);
    return { message: 'Project deleted successfully' };
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @Request() req) {
    return this.projectsService.getVersions(id, req.user.id);
  }

  @Post(':id/versions')
  async createVersion(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.projectsService.createVersion(
      id,
      req.user.id,
      body.content,
      body.commitMessage,
    );
  }

  @Get('versions/:versionId')
  async getVersion(@Param('versionId') versionId: string, @Request() req) {
    return this.projectsService.getVersion(versionId, req.user.id);
  }
}
