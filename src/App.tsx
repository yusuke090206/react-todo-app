import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import CalendarView from "./CalendarView";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faListCheck,
  faCalendarDays,
  faCircleExclamation,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const localStorageKey = "TodoApp";
const userNameStorageKey = "TodoApp_UserName";

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
};

export type FilterType = "all" | "active" | "completed";
export type SortType = "createdAt" | "priority" | "deadline";

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
  }));
};

const getTodoNameError = (name: string): string => {
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 32) {
    return "前後の空白を除いて、2文字以上、32文字以内で入力してください";
  }
  return "";
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(userNameStorageKey) ?? "寝屋川タヌキ";
  });
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [isNameTouched, setIsNameTouched] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("createdAt");

  const uncompletedCount = todos.filter((todo) => !todo.isDone).length;
  const completedCount = todos.length - uncompletedCount;
  const newTodoNameError = getTodoNameError(newTodoName);
  const isNewTodoNameInvalid = newTodoNameError !== "";
  const showNewTodoNameError = isNameTouched && isNewTodoNameInvalid;

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(userNameStorageKey, userName);
  }, [userName]);

  const overdueTodos = useMemo(() => {
    const now = new Date();
    return todos.filter(
      (todo) => !todo.isDone && todo.deadline !== null && todo.deadline < now,
    );
  }, [todos]);

  const normalTodos = useMemo(() => {
    const now = new Date();
    return todos.filter(
      (todo) =>
        todo.isDone || todo.deadline === null || todo.deadline >= now,
    );
  }, [todos]);

  const filteredAndSortedTodos = useMemo(() => {
    return normalTodos
      .filter((todo) => {
        if (filter === "active") return !todo.isDone;
        if (filter === "completed") return todo.isDone;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return a.priority - b.priority;
        if (sortBy === "deadline") {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        }
        return 0;
      });
  }, [normalTodos, filter, sortBy]);

  const updateNewTodoName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(e.target.value);
    setIsNameTouched(true);
  };

  const updateNewTodoPriority = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const addNewTodo = () => {
    if (isNewTodoNameInvalid) {
      setIsNameTouched(true);
      return;
    }

    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName.trim(),
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
    setIsNameTouched(false);
  };

  const updateIsDone = (id: string, value: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isDone: value };
        } else {
          return todo;
        }
      }),
    );
  };

  const removeCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.isDone));
  };

  const remove = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">TodoApp</h1>

          <div className="flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 shadow-xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <FontAwesomeIcon
              icon={faUser}
              className="mr-2 text-sm text-slate-400"
            />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="名前を入力"
              aria-label="ユーザー名"
              className="w-32 text-sm text-slate-700 outline-none sm:w-40"
            />
          </div>
        </div>

        <div className="flex rounded-lg bg-slate-200 p-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={twMerge(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition",
              viewMode === "list"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <FontAwesomeIcon icon={faListCheck} />
            リスト
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={twMerge(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition",
              viewMode === "calendar"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <FontAwesomeIcon icon={faCalendarDays} />
            カレンダー
          </button>
        </div>
      </div>

      <div className="mb-4">
        <WelcomeMessage
          name={userName.trim() === "" ? "ゲスト" : userName.trim()}
          uncompletedCount={uncompletedCount}
        />
      </div>

      {overdueTodos.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-red-700">
            <FontAwesomeIcon icon={faCircleExclamation} />
            期限切れのタスク ({overdueTodos.length}件)
          </h2>
          <TodoList
            todos={overdueTodos}
            updateIsDone={updateIsDone}
            remove={remove}
          />
        </div>
      )}

      {viewMode === "list" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">表示:</span>
              {(
                [
                  { label: "すべて", value: "all" },
                  { label: "未完了", value: "active" },
                  { label: "完了済み", value: "completed" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={twMerge(
                    "rounded-md px-2.5 py-1 font-medium transition",
                    filter === item.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sortSelect" className="font-bold text-slate-700">
                並び替え:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1"
              >
                <option value="createdAt">登録順</option>
                <option value="priority">優先度順</option>
                <option value="deadline">期限順</option>
              </select>
            </div>
          </div>

          <TodoList
            todos={filteredAndSortedTodos}
            updateIsDone={updateIsDone}
            remove={remove}
          />

          <button
            type="button"
            onClick={removeCompletedTodos}
            disabled={completedCount === 0}
            className={twMerge(
              "mt-4 cursor-pointer rounded-md px-3 py-1 font-medium",
              "bg-rose-500 text-white hover:bg-rose-600",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-500",
            )}
          >
            完了済みのタスクを一括削除
          </button>
        </>
      ) : (
        <CalendarView todos={todos} updateIsDone={updateIsDone} />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addNewTodo();
        }}
        aria-labelledby="newTodoHeading"
        className="mt-6 space-y-2 rounded-md border border-slate-300 bg-white p-4 drop-shadow"
      >
        <h2 id="newTodoHeading" className="text-lg font-bold">
          新しいタスクの追加
        </h2>

        <div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="newTodoName">
              名前
            </label>
            <input
              id="newTodoName"
              name="todoName"
              type="text"
              required
              value={newTodoName}
              onChange={updateNewTodoName}
              aria-invalid={showNewTodoNameError}
              aria-describedby={
                showNewTodoNameError ? "newTodoNameError" : undefined
              }
              className={twMerge(
                "min-w-0 grow rounded-md border border-gray-300 p-2",
                showNewTodoNameError && "border-red-500 outline-red-500",
              )}
              placeholder="2文字以上、32文字以内で入力してください"
            />
          </div>
          {showNewTodoNameError && (
            <div
              id="newTodoNameError"
              aria-live="polite"
              className="ml-10 flex items-center space-x-1 text-sm font-medium text-red-500"
            >
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newTodoNameError}</div>
            </div>
          )}
        </div>

        <fieldset>
          <legend className="mb-1 font-bold">優先度</legend>
          <div className="flex gap-5">
            {[1, 2, 3].map((value) => (
              <label key={value} className="flex cursor-pointer items-center space-x-1">
                <input
                  id={`priority-${value}`}
                  name="priorityGroup"
                  type="radio"
                  value={value}
                  checked={newTodoPriority === value}
                  onChange={updateNewTodoPriority}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <label className="font-bold" htmlFor="deadline">
            期限
          </label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={
              newTodoDeadline
                ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm")
                : ""
            }
            onChange={updateDeadline}
            className="max-w-full min-w-0 rounded-md border border-gray-300 px-2 py-1"
          />
        </div>

        <button
          type="submit"
          disabled={isNewTodoNameInvalid}
          className={twMerge(
            "mt-2 cursor-pointer rounded-md px-4 py-2 font-bold text-white transition",
            "bg-indigo-600 hover:bg-indigo-700",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600",
          )}
        >
          追加
        </button>
      </form>
    </div>
  );
};

export default App;