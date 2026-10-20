import type { MealType } from "@/services/api";
import { cn } from "@/utils/utils";
import { DAYS, MEAL_STYLE, MEAL_TYPES } from "./constants";

interface MonthCalendarProps {
  month: number; // 0~11
  weeks: { offset: number; monday: Date }[];
  // weeks 와 같은 순서. [주][요일 0=월] → 끼니별 메뉴명
  weekMeals: Record<number, Partial<Record<MealType, string>>>[];
  weekOffset: number;
  selectedDay: number;
  onSelect: (weekOffset: number, day: number) => void;
}

export function MonthCalendar({
  month,
  weeks,
  weekMeals,
  weekOffset,
  selectedDay,
  onSelect,
}: MonthCalendarProps) {
  const todayStr = new Date().toDateString();

  return (
    <div className="grid grid-cols-7 gap-0.5 md:gap-1">
      {DAYS.map((day) => (
        <div
          key={day}
          className="text-center text-[12px] font-bold text-gray-400 py-1"
        >
          {day}
        </div>
      ))}
      {weeks.flatMap((week, wi) =>
        DAYS.map((day, di) => {
          const date = new Date(week.monday);
          date.setDate(date.getDate() + di);
          const inMonth = date.getMonth() === month;
          const active = week.offset === weekOffset && di === selectedDay;
          const meals = weekMeals[wi]?.[di] ?? {};
          return (
            <button
              key={`${wi}-${day}`}
              onClick={() => onSelect(week.offset, di)}
              className={cn(
                "min-w-0 min-h-14 md:min-h-20 p-0.5 md:p-1.5 rounded-md text-left transition-all flex flex-col",
                active
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100",
                !inMonth && !active && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "text-[12px] font-extrabold",
                  !active &&
                    date.toDateString() === todayStr &&
                    "text-emerald-600",
                )}
              >
                {date.getDate()}
              </span>
              <div className="w-full mt-0.5 flex flex-col gap-px">
                {MEAL_TYPES.map(
                  (mt) =>
                    meals[mt] && (
                      <div
                        key={mt}
                        className={cn(
                          "text-[10px] md:text-[11px] leading-tight font-medium truncate rounded-sm px-0.5 md:px-1 py-px",
                          active ? "bg-white/25 text-white" : MEAL_STYLE[mt].chip,
                        )}
                      >
                        {meals[mt]}
                      </div>
                    ),
                )}
              </div>
            </button>
          );
        }),
      )}
    </div>
  );
}
