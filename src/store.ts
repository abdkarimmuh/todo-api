import { randomUUID } from "crypto";
import { Todo } from "./type.js";

const todos: Todo[] = [];

export const todoStore = {
  getAll: () => todos,
  getById: (id: string) => todos.find((t) => t.id === id),
  create: (data: Omit<Todo, "id" | "completed">) => {
    const todo: Todo = { id: randomUUID(), completed: false, ...data };
    todos.push(todo);
    return todo;
  },
  update: (id: string, data: Partial<Todo>) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return null;
    Object.assign(todo, data);
    return todo;
  },
  remove: (id: string) => {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    todos.splice(idx, 1);
    return true;
  },
};
