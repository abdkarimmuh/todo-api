import { randomUUID } from "crypto";
import { Todo } from "./type.js";
import { db } from "./prisma/db.js";

export const todoStore = {
  getAll: () => db.orm.public.Todo.all(),
  getById: (id: string) => db.orm.public.Todo.where({ id }).first(),
  create: async (data: Omit<Todo, "id" | "completed">) =>
    await db.orm.public.Todo.create({ id: randomUUID(), completed: false, ...data }),
  update: async (id: string, data: Partial<Todo>) =>
    await db.orm.public.Todo.where({ id })
      .update(data)
      .catch(() => null),
  remove: async (id: string) =>
    await db.orm.public.Todo.where({ id })
      .delete()
      .then(() => true)
      .catch(() => false),
};
