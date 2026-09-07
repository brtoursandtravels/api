import type { AdminRole } from "../generated/prisma/enums.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sessionId: string;
        user: {
          id: string;
          email: string;
          displayName: string;
          role: AdminRole;
        };
      };
    }
  }
}

export {};
