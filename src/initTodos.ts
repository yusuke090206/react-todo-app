import type { Todo } from "./types";
import { v4 as uuid } from "uuid";

export const initTodos: Todo[] = [
  {
    id: uuid(),
    name: "Reactの勉強をする",
    isDone: false,
    priority: 2,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    category: "学習",
  },
  {
    id: uuid(),
    name: "牛乳と卵を買う",
    isDone: false,
    priority: 3,
    deadline: null,
    category: "買い物",
  },
];