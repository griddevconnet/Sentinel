import { Router } from "express";
import { reportsController } from "./reports.controller";
import { validate } from "../../middleware/validate";
import { createReportSchema, listReportsQuerySchema } from "./reports.validation";
import { requireAuth } from "../../middleware/auth";
import { reportSubmissionLimiter } from "../../middleware/rate-limit";

export const reportsRouter = Router();

// --- Public, unauthenticated community-facing endpoints ---
reportsRouter.post("/", reportSubmissionLimiter, validate(createReportSchema), reportsController.submit);
reportsRouter.get("/status/:token", reportsController.getByToken);

// --- Health-worker-facing endpoints (auth required) ---
reportsRouter.get("/", requireAuth, validate(listReportsQuerySchema, "query"), reportsController.list);
reportsRouter.get("/:id", requireAuth, reportsController.getById);
