import { useState } from "react";
import type { Todo } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
};

const CalendarView = ({ todos, updateIsDone }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDayOfWeek = startOfMonth.day(); // 0 = 日曜日
  const daysInMonth = currentMonth.daysInMonth();

  // カレンダーグリッド用データ構築
  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(currentMonth.date(day));
  }

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const today = dayjs();

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      {/* カレンダーヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {currentMonth.format("YYYY年 MM月")}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> 前月
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(dayjs())}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
          >
            今月
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100"
          >
            次月 <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-600 mb-2">
        <div className="text-red-500">日</div>
        <div>月</div>
        <div>火</div>
        <div>水</div>
        <div>木</div>
        <div>金</div>
        <div className="text-blue-500">土</div>
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-24 bg-slate-50/50 rounded-md" />;
          }

          const isToday = date.isSame(today, "day");
          const dayTodos = todos.filter(
            (todo) => todo.deadline && dayjs(todo.deadline).isSame(date, "day"),
          );

          return (
            <div
              key={date.toString()}
              className={twMerge(
                "h-24 flex flex-col rounded-md border p-1 text-xs overflow-y-auto transition",
                isToday ? "border-indigo-500 bg-indigo-50/40 font-bold" : "border-slate-200 bg-white",
              )}
            >
              <div
                className={twMerge(
                  "mb-1 text-right font-semibold",
                  date.day() === 0 && "text-red-500",
                  date.day() === 6 && "text-blue-500",
                )}
              >
                {date.date()}
              </div>

              {/* 日付セル内のタスクリスト */}
              <div className="flex flex-col gap-1">
                {dayTodos.map((todo) => {
                  const isOverdue =
                    !todo.isDone &&
                    todo.deadline !== null &&
                    todo.deadline < new Date();

                  return (
                    <div
                      key={todo.id}
                      onClick={() => updateIsDone(todo.id, !todo.isDone)}
                      title={`${todo.name} (クリックで完了切替)`}
                      className={twMerge(
                        "cursor-pointer rounded px-1 py-0.5 text-left truncate leading-tight transition",
                        todo.isDone && "line-through opacity-50 bg-slate-200 text-slate-600",
                        !todo.isDone && isOverdue && "bg-red-200 text-red-900 font-bold",
                        !todo.isDone && !isOverdue && "bg-indigo-100 text-indigo-900",
                      )}
                    >
                      {todo.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;