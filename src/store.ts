import { db } from "./prisma/db.js";

export const todoStore = {
  getAll: () => db.orm.public.Todo.all(),
  getById: (id: string) => db.orm.public.Todo.where({ id }).first(),
  create: async (data: { title: string; deadline?: string }) =>
    await db.orm.public.Todo.create(data),
  update: async (
    id: string,
    data: { title?: string; completed?: boolean; deadline?: string },
  ) =>
    await db.orm.public.Todo.where({ id })
      .update({ ...data, updatedAt: new Date().toISOString() })
      .catch(() => null),
  remove: async (id: string) =>
    await db.orm.public.Todo.where({ id })
      .delete()
      .then(() => true)
      .catch(() => false),
};
