import { FastifyInstance } from "fastify";
import { todoStore } from "../store.js";
import { Todo } from "../type.js";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import {
  createTodoSchema,
  todoParamsSchema,
  updateTodoSchema,
} from "../schemas/todo.js";

export async function todoRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get("/todos", async () => todoStore.getAll());

  server.get(
    "/todos/:id",
    { schema: { params: todoParamsSchema } },
    async (req, reply) => {
      const todo = await todoStore.getById(req.params.id);
      if (!todo) return reply.status(404).send({ error: "Todo not found" });
      return todo;
    },
  );

  server.post(
    "/todos",
    { schema: { body: createTodoSchema } },
    async (req, reply) => {
      const todo = await todoStore.create(req.body);
      return reply.status(201).send(todo);
    },
  );

  server.put(
    "/todos/:id",
    { schema: { params: todoParamsSchema, body: updateTodoSchema } },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = req.body as Partial<Omit<Todo, "id">>;
      const todo = await todoStore.update(id, body);
      if (!todo) return reply.status(404).send({ error: "Todo not found" });
      return todo;
    },
  );

  server.delete(
    "/todos/:id",
    { schema: { params: todoParamsSchema } },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const ok = await todoStore.remove(id);
      if (!ok) return reply.status(404).send({ error: "Todo not found" });
      return reply.status(204).send();
    },
  );
}
