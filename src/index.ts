import fastify from "fastify";
import { todoRoutes } from "./routes/todo.js";

const app = fastify({ logger: true });

app.get("/", async () => {
  return { status: "ok" };
});

app.register(todoRoutes);

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
