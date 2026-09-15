import { z } from "zod/v4";

export const todoParamsSchema = z.object({ id: z.string() });

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty!"),
  deadline: z.string().datetime().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  deadline: z.string().datetime().optional(),
});
