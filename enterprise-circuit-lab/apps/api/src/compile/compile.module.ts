import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompileJob } from './entities/compile-job.entity';
import { CompileController } from './compile.controller';
import { CompileService } from './compile.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompileJob]),
    ProjectsModule,
  ],
  controllers: [CompileController],
  providers: [CompileService],
  exports: [CompileService],
})
export class CompileModule {}
