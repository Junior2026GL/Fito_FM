import { Router } from "express";
import * as controller from "./template.controller.js";

export const templateRoutes = Router();

templateRoutes.get("/", controller.list);
templateRoutes.get("/:id", controller.getById);
templateRoutes.post("/", controller.create);
templateRoutes.put("/:id", controller.update);
templateRoutes.delete("/:id", controller.remove);
