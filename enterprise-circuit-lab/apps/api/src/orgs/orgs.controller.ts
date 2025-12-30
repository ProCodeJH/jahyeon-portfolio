import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get()
  async getUserOrgs(@Request() req) {
    return this.orgsService.findUserOrgs(req.user.id);
  }

  @Get(':id')
  async getOrg(@Param('id') id: string) {
    return this.orgsService.findById(id);
  }

  @Post()
  async createOrg(@Request() req, @Body() orgData: any) {
    return this.orgsService.create(req.user.id, orgData);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.orgsService.getMembers(id);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.orgsService.addMember(id, body.userId, req.user.id, body.role);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.orgsService.removeMember(id, userId, req.user.id);
  }
}
