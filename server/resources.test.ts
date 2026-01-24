import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Resources API", () => {
  it("should list all resources", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resources = await caller.resources.list();

    expect(Array.isArray(resources)).toBe(true);
    expect(resources.length).toBeGreaterThan(0);
  });

  it("should get a resource by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resources = await caller.resources.list();
    if (resources.length > 0) {
      const resource = await caller.resources.get({ id: resources[0].id });
      expect(resource).toBeDefined();
      expect(resource?.id).toBe(resources[0].id);
    }
  });

  it("should increment download count", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resources = await caller.resources.list();
    if (resources.length > 0) {
      const initialCount = resources[0].downloadCount;
      await caller.resources.incrementDownload({ id: resources[0].id });
      
      const updated = await caller.resources.get({ id: resources[0].id });
      expect(updated?.downloadCount).toBe(initialCount + 1);
    }
  });
});

describe("Projects API", () => {
  it("should list all projects", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it("should get a project by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();
    if (projects.length > 0) {
      const project = await caller.projects.get({ id: projects[0].id });
      expect(project).toBeDefined();
      expect(project?.id).toBe(projects[0].id);
    }
  });
});

describe("Certifications API", () => {
  it("should list all certifications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const certifications = await caller.certifications.list();

    expect(Array.isArray(certifications)).toBe(true);
    expect(certifications.length).toBeGreaterThan(0);
  });

  it("should get a certification by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const certifications = await caller.certifications.list();
    if (certifications.length > 0) {
      const certification = await caller.certifications.get({ id: certifications[0].id });
      expect(certification).toBeDefined();
      expect(certification?.id).toBe(certifications[0].id);
    }
  });
});
