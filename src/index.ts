import fastify from "fastify";
import { todoRoutes } from "./routes/todo.js";
import { db } from "./prisma/db.js";

const app = fastify({ logger: true });

app.get("/", async () => {
  return { status: "ok" };
});

async function start() {
  await db.connect({ url: process.env.DATABASE_URL! });
  app.register(todoRoutes);
  app.listen({ port: 3000 }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

start();
