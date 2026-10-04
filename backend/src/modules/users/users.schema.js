import { z } from "zod";

const profileFields = {
  job_title: z.string().trim().max(100).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-\s]*$/, "Solo números, espacios, +, - y paréntesis")
    .optional(),
  city: z.string().trim().max(100).optional()
};

const modulesSchema = z.array(z.string().trim().min(1).max(50)).default([]);

export const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(100).default(""),
    role: z.string().max(50).default(""),
    active: z.string().max(1).default("")
  })
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, _ y -"),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(100),
    ...profileFields,
    role: z.enum(["admin", "user"]),
    modules: modulesSchema
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, _ y -"),
    email: z.string().trim().email().max(160),
    ...profileFields,
    role: z.enum(["admin", "user"]),
    modules: modulesSchema
  }),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

export const userIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8).max(100)
  }),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: z.object({})
});
