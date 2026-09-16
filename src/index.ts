import fastify from "fastify";
import { todoRoutes } from "./routes/todo.js";
import { db } from "./prisma/db.js";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "@fastify/type-provider-zod";
import fastifyJwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth.js";

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.get("/", async () => {
  return { status: "ok" };
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyJwt, { secret: process.env.JWT_SECRET! });

app.decorate("authenticate", async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

app.setErrorHandler((error, req, reply) => {
  app.log.error(error);

  if (
    typeof error === "object" &&
    error !== null &&
    "validation" in error &&
    error.validation
  ) {
    return reply.status(400).send({
      error: "Validation failed",
      details: error.validation,
    });
  }

  return reply.status(500).send({ error: "Internal server error" });
});

async function start() {
  await db.connect({ url: process.env.DATABASE_URL! });
  app.register(authRoutes);
  app.register(todoRoutes);
  app.listen({ port: 3000 }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

start();
