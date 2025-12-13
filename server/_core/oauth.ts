import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const ADMIN_OPEN_ID = "admin-user-vercel";

export function registerOAuthRoutes(app: Express) {
  // Login page
  app.get("/api/auth/login", (req: Request, res: Response) => {
    const error = req.query.error as string | undefined;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          h1 { 
            color: #fff;
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
          }
          .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: #fca5a5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          label {
            display: block;
            color: #94a3b8;
            margin-bottom: 8px;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(255,255,255,0.05);
            color: #fff;
            font-size: 16px;
            margin-bottom: 20px;
          }
          input:focus {
            outline: none;
            border-color: #3b82f6;
          }
          button {
            width: 100%;
            padding: 14px;
            background: #3b82f6;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Admin Login</h1>
          ${error ? '<div class="error">Invalid password</div>' : ''}
          <form method="POST" action="/api/auth/login">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter admin password" required autofocus>
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });

  // Login handler
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("[Auth] ADMIN_PASSWORD not set");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    if (password !== adminPassword) {
      res.redirect("/api/auth/login?error=invalid");
      return;
    }

    try {
      // Create or update admin user
      await db.upsertUser({
        openId: ADMIN_OPEN_ID,
        name: "Admin",
        email: "admin@portfolio.local",
        loginMethod: "password",
        lastSignedIn: new Date(),
        role: "admin",
      });

      const sessionToken = await sdk.createSessionToken(ADMIN_OPEN_ID, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout handler
  app.get("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect(302, "/");
  });

  // Auth status API
  app.get("/api/auth/status", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ authenticated: true, user: { name: user.name, role: user.role } });
    } catch {
      res.json({ authenticated: false });
    }
  });
}
