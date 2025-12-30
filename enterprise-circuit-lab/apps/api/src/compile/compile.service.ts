import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompileJob, CompileStatus } from './entities/compile-job.entity';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class CompileService {
  constructor(
    @InjectRepository(CompileJob)
    private readonly compileJobRepository: Repository<CompileJob>,
    private readonly projectsService: ProjectsService,
  ) {}

  async createJob(versionId: string, userId: string): Promise<CompileJob> {
    // Verify user has access to this version
    await this.projectsService.getVersion(versionId, userId);

    // Create compile job
    const job = this.compileJobRepository.create({
      project_version_id: versionId,
      status: CompileStatus.PENDING,
    });

    const savedJob = await this.compileJobRepository.save(job);

    // TODO: Queue job to BullMQ for worker processing (Phase 1.2)
    console.log(`Created compile job ${savedJob.id} - worker integration pending`);

    return savedJob;
  }

  async findById(id: string): Promise<CompileJob | null> {
    return this.compileJobRepository.findOne({
      where: { id },
      relations: ['projectVersion'],
    });
  }

  async findByVersion(versionId: string): Promise<CompileJob[]> {
    return this.compileJobRepository.find({
      where: { project_version_id: versionId },
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(
    jobId: string,
    status: CompileStatus,
    data?: Partial<CompileJob>,
  ): Promise<CompileJob> {
    const job = await this.findById(jobId);
    if (!job) {
      throw new NotFoundException('Compile job not found');
    }

    job.status = status;

    if (status === CompileStatus.RUNNING && !job.started_at) {
      job.started_at = new Date();
    }

    if ([CompileStatus.SUCCESS, CompileStatus.FAILED, CompileStatus.TIMEOUT].includes(status)) {
      job.completed_at = new Date();
      if (job.started_at) {
        job.duration_ms = job.completed_at.getTime() - job.started_at.getTime();
      }
    }

    if (data) {
      Object.assign(job, data);
    }

    return this.compileJobRepository.save(job);
  }
}
