import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectVersion } from './entities/project-version.entity';
import { OrgsService } from '../orgs/orgs.service';
import { OrgRole } from '../orgs/entities/org-member.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectVersion)
    private readonly versionRepository: Repository<ProjectVersion>,
    private readonly orgsService: OrgsService,
  ) {}

  async create(userId: string, orgId: string, projectData: Partial<Project>): Promise<Project> {
    // Check if user has EDITOR access to org
    const hasAccess = await this.orgsService.checkAccess(userId, orgId, OrgRole.EDITOR);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const project = this.projectRepository.create({
      ...projectData,
      org_id: orgId,
      created_by: userId,
    });

    const savedProject = await this.projectRepository.save(project);

    // Create initial version if content provided
    if (projectData['initialContent']) {
      await this.createVersion(
        savedProject.id,
        userId,
        projectData['initialContent'],
        'Initial version',
      );
    }

    return savedProject;
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['creator', 'org'],
    });
  }

  async findByOrg(orgId: string, userId: string): Promise<Project[]> {
    const hasAccess = await this.orgsService.checkAccess(userId, orgId);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.projectRepository.find({
      where: { org_id: orgId, is_archived: false },
      relations: ['creator'],
      order: { updated_at: 'DESC' },
    });
  }

  async createVersion(
    projectId: string,
    userId: string,
    content: any,
    commitMessage?: string,
  ): Promise<ProjectVersion> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check access
    const hasAccess = await this.orgsService.checkAccess(
      userId,
      project.org_id,
      OrgRole.EDITOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Get next version number
    const latestVersion = await this.versionRepository.findOne({
      where: { project_id: projectId },
      order: { version: 'DESC' },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = this.versionRepository.create({
      project_id: projectId,
      version: nextVersion,
      content_json: content,
      created_by: userId,
      commit_message: commitMessage,
    });

    return this.versionRepository.save(version);
  }

  async getVersions(projectId: string, userId: string): Promise<ProjectVersion[]> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = await this.orgsService.checkAccess(userId, project.org_id);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.versionRepository.find({
      where: { project_id: projectId },
      order: { version: 'DESC' },
      relations: ['creator'],
    });
  }

  async getVersion(versionId: string, userId: string): Promise<ProjectVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
      relations: ['project'],
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const hasAccess = await this.orgsService.checkAccess(userId, version.project.org_id);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return version;
  }

  async update(projectId: string, userId: string, updateData: Partial<Project>): Promise<Project> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = await this.orgsService.checkAccess(
      userId,
      project.org_id,
      OrgRole.EDITOR,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient permissions');
    }

    Object.assign(project, updateData);
    return this.projectRepository.save(project);
  }

  async delete(projectId: string, userId: string): Promise<void> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = await this.orgsService.checkAccess(
      userId,
      project.org_id,
      OrgRole.ADMIN,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Only admins can delete projects');
    }

    await this.projectRepository.remove(project);
  }
}
