import { FastifyInstance } from "fastify";
import { todoStore } from "../store/todo";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import {
  createTodoSchema,
  todoParamsSchema,
  updateTodoSchema,
} from "../schemas/todo.js";

export async function todoRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.addHook("preHandler", app.authenticate);

  server.get("/todos", async (req) => todoStore.getAllByUser(req.user.id));

  server.get(
    "/todos/:id",
    { schema: { params: todoParamsSchema } },
    async (req, reply) => {
      const todo = await todoStore.getByIdForUser(req.params.id, req.user.id);
      if (!todo) return reply.status(404).send({ error: "Todo not found" });
      return todo;
    },
  );

  server.post(
    "/todos",
    { schema: { body: createTodoSchema } },
    async (req, reply) => {
      const todo = await todoStore.create({ ...req.body, userId: req.user.id });
      return reply.status(201).send(todo);
    },
  );

  server.put(
    "/todos/:id",
    { schema: { params: todoParamsSchema, body: updateTodoSchema } },
    async (req, reply) => {
      const todo = await todoStore.updateForUser(
        req.params.id,
        req.user.id,
        req.body,
      );
      if (!todo) return reply.status(404).send({ error: "Todo not found" });
      return todo;
    },
  );

  server.delete(
    "/todos/:id",
    { schema: { params: todoParamsSchema } },
    async (req, reply) => {
      const ok = await todoStore.removeForUser(req.params.id, req.user.id);
      if (!ok) return reply.status(404).send({ error: "Todo not found" });
      return reply.status(204).send();
    },
  );
}
