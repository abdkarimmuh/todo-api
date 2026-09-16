import { db } from "../prisma/db";

export const userStore = {
  findByEmail: (email: string) => db.orm.public.User.where({ email }).first(),
  create: (data: { email: string; password: string }) =>
    db.orm.public.User.create(data),
};
