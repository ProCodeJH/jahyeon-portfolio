import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Org } from './org.entity';
import { User } from '../../users/entities/user.entity';

export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity('org_members')
export class OrgMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  org_id: string;

  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: OrgRole,
    default: OrgRole.VIEWER,
  })
  role: OrgRole;

  @Column({ type: 'uuid', nullable: true })
  invited_by: string;

  @CreateDateColumn()
  joined_at: Date;

  @ManyToOne(() => Org, (org) => org.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
