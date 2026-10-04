import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(80),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1).max(100),
    newPassword: z.string().min(8).max(100)
  }),
  params: z.object({}),
  query: z.object({})
});
