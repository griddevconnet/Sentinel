import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { generalLimiter } from "./middleware/rate-limit";
import { notFoundHandler, errorHandler } from "./middleware/error-handler";

import { authRouter } from "./modules/auth/auth.routes";
import { healthWorkersRouter } from "./modules/health-workers/health-workers.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { triageRouter } from "./modules/triage/triage.routes";
import { incidentsRouter } from "./modules/incidents/incidents.routes";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, exposedHeaders: ["Retry-After", "RateLimit-Reset", "RateLimit-Limit", "RateLimit-Remaining"] }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));
  app.use(generalLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const api = express.Router();
  api.use("/auth", authRouter);
  api.use("/health-workers", healthWorkersRouter);
  api.use("/reports", reportsRouter);
  api.use("/triage", triageRouter);
  api.use("/incidents", incidentsRouter);

  app.use(env.API_PREFIX, api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}