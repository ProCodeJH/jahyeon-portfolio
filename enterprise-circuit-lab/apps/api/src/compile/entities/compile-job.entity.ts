import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectVersion } from '../../projects/entities/project-version.entity';

export enum CompileStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

@Entity('compile_jobs')
export class CompileJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  project_version_id: string;

  @Column({
    type: 'enum',
    enum: CompileStatus,
    default: CompileStatus.PENDING,
  })
  status: CompileStatus;

  @Column({ type: 'text', nullable: true })
  log: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  artifact_url_hex: string;

  @Column({ type: 'text', nullable: true })
  artifact_url_elf: string;

  @Column({ type: 'text', nullable: true })
  artifact_url_map: string;

  @Column({ type: 'timestamptz', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date;

  @Column({ type: 'integer', nullable: true })
  duration_ms: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ProjectVersion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_version_id' })
  projectVersion: ProjectVersion;
}
