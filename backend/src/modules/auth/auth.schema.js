import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(80),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});
