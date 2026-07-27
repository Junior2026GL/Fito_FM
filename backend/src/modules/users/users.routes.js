import { Router } from "express";

import { requireAuth } from "../../shared/middleware/auth.middleware.js";
import { allowRoles } from "../../shared/middleware/roles.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { listUsersSchema, createUserSchema, updateUserSchema, userIdSchema } from "./users.schema.js";
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  toggleUserStatus
} from "./users.controller.js";

export const usersRoutes = Router();

// Todas las rutas de usuarios requieren autenticación y rol admin
usersRoutes.use(requireAuth, allowRoles("admin"));

usersRoutes.get("/", validate(listUsersSchema), listUsers);
usersRoutes.post("/", validate(createUserSchema), createUser);
usersRoutes.get("/:id", validate(userIdSchema), getUser);
usersRoutes.put("/:id", validate(updateUserSchema), updateUser);
usersRoutes.patch("/:id/status", validate(userIdSchema), toggleUserStatus);
