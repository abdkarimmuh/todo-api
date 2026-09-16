import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { loginSchema, registerSchema } from "../schemas/auth";
import { userStore } from "../store/user";

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    "/auth/register",
    { schema: { body: registerSchema } },
    async (req, reply) => {
      const existing = await userStore.findByEmail(req.body.email);
      if (existing)
        return reply.status(409).send({ error: "Email sudah terdaftar" });

      const hashed = await argon2.hash(req.body.password);
      const user = await userStore.create({
        email: req.body.email,
        password: hashed,
      });

      const token = app.jwt.sign({ id: user.id, email: user.email });
      return reply.status(201).send({ token });
    },
  );

  server.post(
    "/auth/login",
    { schema: { body: loginSchema } },
    async (req, reply) => {
      const user = await userStore.findByEmail(req.body.email);
      if (!user)
        return reply.status(401).send({ error: "Email atau password salah" });

      const valid = await argon2.verify(user.password, req.body.password);
      if (!valid)
        return reply.status(401).send({ error: "Email atau password salah" });

      const token = app.jwt.sign({ id: user.id, email: user.email });
      return reply.send({ token });
    },
  );
}
