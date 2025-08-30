import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  service: z.string(),
  time: z.string(), // ISO
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const HelloResponseSchema = z.object({
  message: z.string(),
});
export type HelloResponse = z.infer<typeof HelloResponseSchema>;
