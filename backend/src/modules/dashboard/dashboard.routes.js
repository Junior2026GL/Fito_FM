import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { requireModule } from "../../shared/middleware/modules.middleware.js";
import { getSummary } from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth, requireModule("dashboard"));

dashboardRoutes.get("/summary", getSummary);
