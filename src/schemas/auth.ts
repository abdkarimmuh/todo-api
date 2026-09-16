import { z } from "zod/v4";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
