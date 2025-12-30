import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectVersion } from './entities/project-version.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectVersion]),
    OrgsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
