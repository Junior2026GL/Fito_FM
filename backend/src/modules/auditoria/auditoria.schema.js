import { z } from "zod";

export const listLogsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(100).default(""),
    action: z.string().max(50).default(""),
    entity: z.string().max(50).default("")
  })
});
