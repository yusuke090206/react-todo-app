import type { Todo, Category } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faPersonDigging,
  faTriangleExclamation,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todo: Todo;
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const categoryStyles: Record<Category, string> = {
  仕事: "bg-sky-100 text-sky-800 border-sky-200",
  プライベート: "bg-emerald-100 text-emerald-800 border-emerald-200",
  学習: "bg-purple-100 text-purple-800 border-purple-200",
  買い物: "bg-orange-100 text-orange-800 border-orange-200",
  その他: "bg-slate-100 text-slate-700 border-slate-200",
};

const num2star = (n: number): string => "★".repeat(4 - n);

const formattedDate = (date: Date) => {
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return dayjs(date).format("YYYY/MM/DD");
  }
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

const TodoItem = (props: Props) => {
  const todo = props.todo;
  const now = new Date();

  const isOverdue =
    !todo.isDone && todo.deadline !== null && todo.deadline < now;

  const isNearDeadline =
    !todo.isDone &&
    !isOverdue &&
    todo.deadline !== null &&
    todo.deadline.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;

  return (
    <div
      className={twMerge(
        "flex items-center justify-between gap-3 rounded-md border p-3.5 transition drop-shadow",
        isOverdue && "border-red-300 bg-red-50 text-red-900",
        isNearDeadline && "border-amber-300 bg-amber-50 text-amber-900",
        !isOverdue && !isNearDeadline && "border-slate-300 bg-white",
      )}
    >
      <div
        className={twMerge(
          "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
          todo.isDone && "opacity-60",
        )}
      >
        <label className="flex min-w-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={todo.isDone}
            onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
            className="mr-3 shrink-0 cursor-pointer"
          />
          <FontAwesomeIcon
            icon={faPersonDigging}
            className="mr-2 shrink-0 text-slate-500"
          />
          <span
            className={twMerge(
              "min-w-0 text-lg font-medium wrap-anywhere",
              todo.isDone ? "line-through text-slate-500" : "text-slate-800",
            )}
          >
            {todo.name}
          </span>
        </label>

        <span
          className={twMerge(
            "rounded-full border px-2.5 py-0.5 text-xs font-bold",
            categoryStyles[todo.category],
          )}
        >
          {todo.category}
        </span>

        <span
          aria-label={`優先度: ${todo.priority}`}
          className="font-bold tracking-tighter text-orange-400"
        >
          {num2star(todo.priority)}
        </span>

        {todo.deadline && (
          <span
            className={twMerge(
              "flex items-center text-sm font-medium",
              isOverdue && "font-bold text-red-600",
              isNearDeadline && "font-bold text-amber-700",
              !isOverdue && !isNearDeadline && "text-slate-500",
            )}
          >
            <FontAwesomeIcon
              icon={
                isOverdue
                  ? faCircleExclamation
                  : isNearDeadline
                    ? faTriangleExclamation
                    : faClock
              }
              className="mr-1"
            />
            {formattedDate(todo.deadline)}
            {isOverdue && <span className="ml-1 font-bold">(期限切れ)</span>}
            {isNearDeadline && (
              <span className="ml-1 font-bold">(まもなく期限)</span>
            )}
          </span>
        )}

        {todo.isDone && (
          <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-white">
            完了済み
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => props.remove(todo.id)}
        aria-label={`${todo.name}を削除`}
        className={twMerge(
          "shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-sm font-bold transition",
          "bg-rose-400 text-white hover:bg-rose-600",
        )}
      >
        削除
      </button>
    </div>
  );
};

export default TodoItem;