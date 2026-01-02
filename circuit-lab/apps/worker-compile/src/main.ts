/**
 * Arduino Compile Worker
 * Secure sandbox for compiling Arduino sketches using arduino-cli
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const COMPILE_TIMEOUT = parseInt(process.env.COMPILE_TIMEOUT || '30000', 10);
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_JOBS || '4', 10);
const TEMP_DIR = '/tmp/compile';
const OUTPUT_DIR = '/tmp/output';

// Board FQBN mappings
const BOARD_FQBN: Record<string, string> = {
  uno: 'arduino:avr:uno',
  mega: 'arduino:avr:mega:cpu=atmega2560',
  nano: 'arduino:avr:nano:cpu=atmega328',
  leonardo: 'arduino:avr:leonardo',
  micro: 'arduino:avr:micro',
  due: 'arduino:sam:arduino_due_x_dbg',
};

interface CompileJob {
  id: string;
  code: string;
  board: string;
  userId?: string;
}

interface CompileResult {
  success: boolean;
  hexPath?: string;
  elfPath?: string;
  programSize?: number;
  dataSize?: number;
  errors?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }>;
  warnings?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }>;
  output?: string;
}

// Redis connection
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

/**
 * Compile Arduino sketch
 */
async function compileSketch(job: CompileJob): Promise<CompileResult> {
  const workDir = join(TEMP_DIR, job.id);
  const sketchDir = join(workDir, 'sketch');
  const outputDir = join(OUTPUT_DIR, job.id);

  try {
    // Create directories
    await fs.mkdir(sketchDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    // Write sketch file
    const sketchPath = join(sketchDir, 'sketch.ino');
    await fs.writeFile(sketchPath, job.code, 'utf-8');

    // Get FQBN
    const fqbn = BOARD_FQBN[job.board] || BOARD_FQBN.uno;

    // Run arduino-cli compile
    const result = await runArduinoCli([
      'compile',
      '--fqbn', fqbn,
      '--output-dir', outputDir,
      '--warnings', 'all',
      '--verbose',
      sketchDir,
    ]);

    // Parse output
    const errors = parseErrors(result.stderr);
    const warnings = parseWarnings(result.stderr);

    if (result.exitCode !== 0) {
      return {
        success: false,
        errors,
        warnings,
        output: result.stderr,
      };
    }

    // Read output files
    const hexPath = join(outputDir, 'sketch.ino.hex');
    const elfPath = join(outputDir, 'sketch.ino.elf');

    // Get sizes
    const sizeResult = await runArduinoCli([
      'compile',
      '--fqbn', fqbn,
      '--show-properties',
      sketchDir,
    ]);

    // Parse sizes from output
    const sizeMatch = result.stdout.match(/Sketch uses (\d+) bytes.*?Maximum is (\d+)/);
    const dataMatch = result.stdout.match(/Global variables use (\d+) bytes/);

    return {
      success: true,
      hexPath,
      elfPath,
      programSize: sizeMatch ? parseInt(sizeMatch[1], 10) : undefined,
      dataSize: dataMatch ? parseInt(dataMatch[1], 10) : undefined,
      warnings,
      output: result.stdout,
    };
  } catch (error) {
    logger.error({ error, jobId: job.id }, 'Compilation error');
    return {
      success: false,
      errors: [{
        file: 'sketch.ino',
        line: 0,
        column: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
    };
  } finally {
    // Cleanup work directory
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Run arduino-cli command
 */
function runArduinoCli(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  return new Promise((resolve, reject) => {
    const proc = spawn('arduino-cli', args, {
      timeout: COMPILE_TIMEOUT,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse compilation errors from output
 */
function parseErrors(output: string): Array<{
  file: string;
  line: number;
  column: number;
  message: string;
}> {
  const errors: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }> = [];

  // Match GCC error format: file:line:column: error: message
  const errorRegex = /([^:]+):(\d+):(\d+):\s*error:\s*(.+)/g;
  let match;

  while ((match = errorRegex.exec(output)) !== null) {
    errors.push({
      file: match[1].split('/').pop() || match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      message: match[4].trim(),
    });
  }

  return errors;
}

/**
 * Parse compilation warnings from output
 */
function parseWarnings(output: string): Array<{
  file: string;
  line: number;
  column: number;
  message: string;
}> {
  const warnings: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }> = [];

  // Match GCC warning format: file:line:column: warning: message
  const warningRegex = /([^:]+):(\d+):(\d+):\s*warning:\s*(.+)/g;
  let match;

  while ((match = warningRegex.exec(output)) !== null) {
    warnings.push({
      file: match[1].split('/').pop() || match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      message: match[4].trim(),
    });
  }

  return warnings;
}

// Create worker
const worker = new Worker<CompileJob, CompileResult>(
  'compile',
  async (job: Job<CompileJob, CompileResult>) => {
    logger.info({ jobId: job.data.id, board: job.data.board }, 'Starting compilation');

    const startTime = Date.now();
    const result = await compileSketch(job.data);
    const duration = Date.now() - startTime;

    logger.info({
      jobId: job.data.id,
      success: result.success,
      duration,
      errors: result.errors?.length || 0,
      warnings: result.warnings?.length || 0,
    }, 'Compilation completed');

    return result;
  },
  {
    connection,
    concurrency: MAX_CONCURRENT,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute max
    },
  }
);

// Event handlers
worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, error: error.message }, 'Job failed');
});

worker.on('error', (error) => {
  logger.error({ error: error.message }, 'Worker error');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
});

logger.info({ concurrency: MAX_CONCURRENT }, 'Compile worker started');
