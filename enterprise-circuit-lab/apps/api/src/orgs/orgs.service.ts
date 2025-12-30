import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './entities/org.entity';
import { OrgMember, OrgRole } from './entities/org-member.entity';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    @InjectRepository(OrgMember)
    private readonly orgMemberRepository: Repository<OrgMember>,
  ) {}

  async create(userId: string, orgData: Partial<Org>): Promise<Org> {
    const org = this.orgRepository.create(orgData);
    const savedOrg = await this.orgRepository.save(org);

    // Add creator as OWNER
    const member = this.orgMemberRepository.create({
      org_id: savedOrg.id,
      user_id: userId,
      role: OrgRole.OWNER,
    });
    await this.orgMemberRepository.save(member);

    return savedOrg;
  }

  async findById(id: string): Promise<Org | null> {
    return this.orgRepository.findOne({ where: { id } });
  }

  async findUserOrgs(userId: string): Promise<Org[]> {
    const memberships = await this.orgMemberRepository.find({
      where: { user_id: userId },
      relations: ['org'],
    });

    return memberships.map((m) => m.org);
  }

  async getUserRole(userId: string, orgId: string): Promise<OrgRole | null> {
    const member = await this.orgMemberRepository.findOne({
      where: { user_id: userId, org_id: orgId },
    });

    return member?.role || null;
  }

  async checkAccess(
    userId: string,
    orgId: string,
    minRole: OrgRole = OrgRole.VIEWER,
  ): Promise<boolean> {
    const role = await this.getUserRole(userId, orgId);
    if (!role) return false;

    const hierarchy = {
      OWNER: 4,
      ADMIN: 3,
      EDITOR: 2,
      VIEWER: 1,
    };

    return hierarchy[role] >= hierarchy[minRole];
  }

  async addMember(
    orgId: string,
    userId: string,
    invitedBy: string,
    role: OrgRole = OrgRole.VIEWER,
  ): Promise<OrgMember> {
    // Check if inviter has admin access
    const hasAccess = await this.checkAccess(invitedBy, orgId, OrgRole.ADMIN);
    if (!hasAccess) {
      throw new ForbiddenException('Only admins can add members');
    }

    const member = this.orgMemberRepository.create({
      org_id: orgId,
      user_id: userId,
      role,
      invited_by: invitedBy,
    });

    return this.orgMemberRepository.save(member);
  }

  async removeMember(orgId: string, userId: string, removedBy: string): Promise<void> {
    const hasAccess = await this.checkAccess(removedBy, orgId, OrgRole.ADMIN);
    if (!hasAccess) {
      throw new ForbiddenException('Only admins can remove members');
    }

    await this.orgMemberRepository.delete({ org_id: orgId, user_id: userId });
  }

  async getMembers(orgId: string): Promise<OrgMember[]> {
    return this.orgMemberRepository.find({
      where: { org_id: orgId },
      relations: ['user'],
    });
  }
}
