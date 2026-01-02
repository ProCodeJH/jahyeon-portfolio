/**
 * Compile Routes
 * Arduino code compilation via Docker sandbox
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Compile request schema
const compileSchema = z.object({
  code: z.string().min(1),
  board: z.enum(['uno', 'mega', 'nano', 'leonardo']).default('uno'),
});

// Board configurations
const BOARD_CONFIGS = {
  uno: {
    fqbn: 'arduino:avr:uno',
    flashSize: 32256,
    ramSize: 2048,
  },
  mega: {
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
    flashSize: 253952,
    ramSize: 8192,
  },
  nano: {
    fqbn: 'arduino:avr:nano:cpu=atmega328',
    flashSize: 30720,
    ramSize: 2048,
  },
  leonardo: {
    fqbn: 'arduino:avr:leonardo',
    flashSize: 28672,
    ramSize: 2560,
  },
};

// Compilation job store (would be Redis/BullMQ in production)
const compileJobs = new Map<string, {
  id: string;
  status: 'pending' | 'compiling' | 'completed' | 'failed';
  code: string;
  board: string;
  result?: {
    success: boolean;
    hexData?: string; // Base64 encoded
    elfData?: string;
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
  };
  createdAt: Date;
  completedAt?: Date;
}>();

export async function compileRoutes(fastify: FastifyInstance) {
  // Auth middleware
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({
        error: true,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }
  };

  // Submit compile job
  fastify.post('/', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest) => {
    const body = compileSchema.parse(request.body);

    const job = {
      id: nanoid(),
      status: 'pending' as const,
      code: body.code,
      board: body.board,
      createdAt: new Date(),
    };

    compileJobs.set(job.id, job);

    // In production, this would queue to BullMQ
    // For demo, simulate compilation
    simulateCompilation(job.id, body.code, body.board);

    return {
      jobId: job.id,
      status: job.status,
    };
  });

  // Get compile job status
  fastify.get('/:jobId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { jobId } = request.params as { jobId: string };

    const job = compileJobs.get(jobId);
    if (!job) {
      return reply.status(404).send({
        error: true,
        message: 'Job not found',
        code: 'NOT_FOUND',
      });
    }

    return job;
  });

  // Get HEX file
  fastify.get('/:jobId/hex', async (request: FastifyRequest, reply: FastifyReply) => {
    const { jobId } = request.params as { jobId: string };

    const job = compileJobs.get(jobId);
    if (!job) {
      return reply.status(404).send({
        error: true,
        message: 'Job not found',
        code: 'NOT_FOUND',
      });
    }

    if (job.status !== 'completed' || !job.result?.success) {
      return reply.status(400).send({
        error: true,
        message: 'Compilation not successful',
        code: 'COMPILATION_FAILED',
      });
    }

    // Return hex data as binary
    const hexBuffer = Buffer.from(job.result.hexData || '', 'base64');
    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="sketch.hex"`);
    return reply.send(hexBuffer);
  });

  // WebSocket for real-time compilation updates
  fastify.get('/ws', { websocket: true }, (connection, request) => {
    connection.socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'subscribe' && data.jobId) {
          // Would subscribe to job updates
          connection.socket.send(JSON.stringify({
            type: 'subscribed',
            jobId: data.jobId,
          }));
        }
      } catch {
        // Invalid message
      }
    });
  });
}

/**
 * Simulate compilation (in production, this would use Docker/arduino-cli)
 */
async function simulateCompilation(
  jobId: string,
  code: string,
  board: string
): Promise<void> {
  const job = compileJobs.get(jobId);
  if (!job) return;

  // Update status to compiling
  job.status = 'compiling';
  compileJobs.set(jobId, job);

  // Simulate compilation delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Parse code for basic validation
  const errors: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }> = [];
  const warnings: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }> = [];

  // Basic syntax checks
  if (!code.includes('void setup()')) {
    errors.push({
      file: 'sketch.ino',
      line: 1,
      column: 1,
      message: "Missing 'void setup()' function",
    });
  }

  if (!code.includes('void loop()')) {
    errors.push({
      file: 'sketch.ino',
      line: 1,
      column: 1,
      message: "Missing 'void loop()' function",
    });
  }

  // Check for common issues
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    // Check for missing semicolons (simplified)
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.endsWith(';') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('/*') &&
      !trimmed.endsWith('*/') &&
      !trimmed.includes('if') &&
      !trimmed.includes('else') &&
      !trimmed.includes('for') &&
      !trimmed.includes('while') &&
      trimmed.includes('(') &&
      trimmed.includes(')')
    ) {
      // This is a very simplified check
    }

    // Check for delay without value
    if (trimmed.includes('delay()') || trimmed.includes('delay( )')) {
      errors.push({
        file: 'sketch.ino',
        line: index + 1,
        column: trimmed.indexOf('delay'),
        message: "delay() requires a numeric argument",
      });
    }
  });

  // Generate result
  if (errors.length > 0) {
    job.status = 'failed';
    job.result = {
      success: false,
      errors,
      warnings,
    };
  } else {
    // Generate mock HEX data
    const mockHex = generateMockHex(code);
    const boardConfig = BOARD_CONFIGS[board as keyof typeof BOARD_CONFIGS];

    job.status = 'completed';
    job.result = {
      success: true,
      hexData: Buffer.from(mockHex).toString('base64'),
      programSize: Math.min(mockHex.length, boardConfig.flashSize),
      dataSize: Math.floor(Math.random() * 100) + 50,
      warnings,
    };
  }

  job.completedAt = new Date();
  compileJobs.set(jobId, job);
}

/**
 * Generate mock Intel HEX format data
 */
function generateMockHex(code: string): string {
  const lines: string[] = [];

  // Calculate a simple hash based on code
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash + code.charCodeAt(i)) | 0;
  }

  // Generate some mock hex lines
  let address = 0;
  for (let i = 0; i < 20; i++) {
    const data = [];
    for (let j = 0; j < 16; j++) {
      data.push((hash + i * 16 + j) & 0xFF);
    }

    // Intel HEX format: :LLAAAATT[DD...]CC
    const byteCount = data.length;
    const recordType = 0x00; // Data record

    let checksum = byteCount;
    checksum += (address >> 8) & 0xFF;
    checksum += address & 0xFF;
    checksum += recordType;
    data.forEach(b => checksum += b);
    checksum = (~checksum + 1) & 0xFF;

    const line = `:${byteCount.toString(16).padStart(2, '0').toUpperCase()}` +
      `${address.toString(16).padStart(4, '0').toUpperCase()}` +
      `${recordType.toString(16).padStart(2, '0').toUpperCase()}` +
      data.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('') +
      `${checksum.toString(16).padStart(2, '0').toUpperCase()}`;

    lines.push(line);
    address += 16;
  }

  // End of file record
  lines.push(':00000001FF');

  return lines.join('\n');
}
