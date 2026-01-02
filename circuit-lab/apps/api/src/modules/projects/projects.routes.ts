/**
 * Projects Routes
 * CRUD operations for circuit projects
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Project schema
const projectSchema = z.object({
  name: z.string().min(1).max(100),
  components: z.array(z.any()),
  wires: z.array(z.any()),
  code: z.string(),
  settings: z.object({
    gridSnap: z.boolean(),
    gridSize: z.number(),
    showLabels: z.boolean(),
    showPinNumbers: z.boolean(),
    showCurrentFlow: z.boolean(),
    simulationSpeed: z.number(),
    theme: z.enum(['light', 'dark']),
  }),
});

// Mock project store (would be database in production)
const projects = new Map<string, {
  id: string;
  name: string;
  ownerId: string;
  components: unknown[];
  wires: unknown[];
  code: string;
  settings: z.infer<typeof projectSchema>['settings'];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}>();

// Project permissions
const projectPermissions = new Map<string, {
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}>();

export async function projectRoutes(fastify: FastifyInstance) {
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

  // Create project
  fastify.post('/', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest) => {
    const body = projectSchema.parse(request.body);
    const { userId } = request.user as { userId: string };

    const project = {
      id: nanoid(),
      name: body.name,
      ownerId: userId,
      components: body.components,
      wires: body.wires,
      code: body.code,
      settings: body.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    };

    projects.set(project.id, project);

    // Add owner permission
    projectPermissions.set(`${project.id}_${userId}`, {
      projectId: project.id,
      userId,
      role: 'owner',
    });

    return project;
  });

  // List projects
  fastify.get('/', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest) => {
    const { userId } = request.user as { userId: string };

    // Get user's projects
    const userProjects = Array.from(projects.values()).filter(p => {
      // Owner or has permission
      if (p.ownerId === userId) return true;
      const permission = projectPermissions.get(`${p.id}_${userId}`);
      return !!permission;
    });

    return userProjects.map(p => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      isPublic: p.isPublic,
    }));
  });

  // Get project by ID
  fastify.get('/:id', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };

    const project = projects.get(id);
    if (!project) {
      return reply.status(404).send({
        error: true,
        message: 'Project not found',
        code: 'NOT_FOUND',
      });
    }

    // Check permission
    const hasAccess = project.ownerId === userId ||
      project.isPublic ||
      !!projectPermissions.get(`${id}_${userId}`);

    if (!hasAccess) {
      return reply.status(403).send({
        error: true,
        message: 'Access denied',
        code: 'FORBIDDEN',
      });
    }

    return project;
  });

  // Update project
  fastify.put('/:id', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };
    const body = projectSchema.partial().parse(request.body);

    const project = projects.get(id);
    if (!project) {
      return reply.status(404).send({
        error: true,
        message: 'Project not found',
        code: 'NOT_FOUND',
      });
    }

    // Check edit permission
    const permission = projectPermissions.get(`${id}_${userId}`);
    const canEdit = project.ownerId === userId ||
      (permission && ['owner', 'admin', 'editor'].includes(permission.role));

    if (!canEdit) {
      return reply.status(403).send({
        error: true,
        message: 'Access denied',
        code: 'FORBIDDEN',
      });
    }

    // Update project
    const updated = {
      ...project,
      ...body,
      updatedAt: new Date(),
    };
    projects.set(id, updated);

    return updated;
  });

  // Delete project
  fastify.delete('/:id', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };

    const project = projects.get(id);
    if (!project) {
      return reply.status(404).send({
        error: true,
        message: 'Project not found',
        code: 'NOT_FOUND',
      });
    }

    // Only owner can delete
    if (project.ownerId !== userId) {
      return reply.status(403).send({
        error: true,
        message: 'Only owner can delete project',
        code: 'FORBIDDEN',
      });
    }

    projects.delete(id);

    // Remove all permissions
    for (const [key] of projectPermissions) {
      if (key.startsWith(`${id}_`)) {
        projectPermissions.delete(key);
      }
    }

    return { success: true };
  });

  // Share project
  fastify.post('/:id/share', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };
    const { targetUserId, role } = request.body as {
      targetUserId: string;
      role: 'admin' | 'editor' | 'viewer';
    };

    const project = projects.get(id);
    if (!project) {
      return reply.status(404).send({
        error: true,
        message: 'Project not found',
        code: 'NOT_FOUND',
      });
    }

    // Only owner/admin can share
    const permission = projectPermissions.get(`${id}_${userId}`);
    const canShare = project.ownerId === userId ||
      (permission && ['owner', 'admin'].includes(permission.role));

    if (!canShare) {
      return reply.status(403).send({
        error: true,
        message: 'Access denied',
        code: 'FORBIDDEN',
      });
    }

    // Add permission
    projectPermissions.set(`${id}_${targetUserId}`, {
      projectId: id,
      userId: targetUserId,
      role,
    });

    return { success: true };
  });

  // Toggle public access
  fastify.post('/:id/visibility', {
    preHandler: [authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };
    const { isPublic } = request.body as { isPublic: boolean };

    const project = projects.get(id);
    if (!project) {
      return reply.status(404).send({
        error: true,
        message: 'Project not found',
        code: 'NOT_FOUND',
      });
    }

    // Only owner can change visibility
    if (project.ownerId !== userId) {
      return reply.status(403).send({
        error: true,
        message: 'Only owner can change visibility',
        code: 'FORBIDDEN',
      });
    }

    project.isPublic = isPublic;
    projects.set(id, project);

    return { success: true, isPublic };
  });
}
