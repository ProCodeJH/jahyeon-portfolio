import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

@Entity('project_versions')
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  project_id: string;

  @Column()
  version: number;

  @Column('jsonb')
  content_json: any;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  commit_message: string;

  @ManyToOne(() => Project, (project) => project.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
