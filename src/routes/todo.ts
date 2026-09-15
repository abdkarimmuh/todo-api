import { FastifyInstance } from "fastify";
import { todoStore } from "../store.js";
import { Todo } from "../type.js";

export async function todoRoutes(app: FastifyInstance) {
  app.get("/todos", async () => todoStore.getAll());

  app.get("/todos/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const todo = await todoStore.getById(id);
    if (!todo) return reply.status(404).send({ error: "Todo not found" });
    return todo;
  });

  app.post("/todos", async (req, reply) => {
    const body = req.body as { title: string; deadline?: string };
    const todo = await todoStore.create(body);
    return reply.status(201).send(todo);
  });

  app.put("/todos/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<Omit<Todo, "id">>;
    const todo = await todoStore.update(id, body);
    if (!todo) return reply.status(404).send({ error: "Todo not found" });
    return todo;
  });

  app.delete("/todos/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const ok = await todoStore.remove(id);
    if (!ok) return reply.status(404).send({ error: "Todo not found" });
    return reply.status(204).send();
  });
}
