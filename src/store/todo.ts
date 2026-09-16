import { db } from "../prisma/db";

export const todoStore = {
  getAllByUser: (userId: string) => db.orm.public.Todo.where({ userId }).all(),
  getByIdForUser: (id: string, userId: string) =>
    db.orm.public.Todo.where({ id, userId }).first(),
  create: (data: { title: string; deadline?: string; userId: string }) =>
    db.orm.public.Todo.create(data),
  updateForUser: (
    id: string,
    userId: string,
    data: { title?: string; completed?: boolean; deadline?: string },
  ) =>
    db.orm.public.Todo.where({ id, userId })
      .update(data)
      .catch(() => null),
  removeForUser: (id: string, userId: string) =>
    db.orm.public.Todo.where({ id, userId })
      .delete()
      .then(() => true)
      .catch(() => false),
};
