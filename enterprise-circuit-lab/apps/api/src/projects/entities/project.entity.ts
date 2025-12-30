import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Org } from '../../orgs/entities/org.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectVersion } from './project-version.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  org_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_compiled_at: Date;

  @Column({ default: false })
  is_archived: boolean;

  @ManyToOne(() => Org, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ProjectVersion, (version) => version.project)
  versions: ProjectVersion[];
}
