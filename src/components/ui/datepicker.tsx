import { useMemo, useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTrackerContext } from "@/context/TrackerContext";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DatePicker2() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { activeDate, setActiveDate, setDayOffset } = useTrackerContext();

  const onDateSelect = (date?: Date) => {
    if (!date) return;

    const dayDiff = daysBetweenDates(new Date(), date);

    setActiveDate(date);
    setDayOffset(dayDiff);
    setCalendarOpen(false);
  };

  const onPrevDayClick = () => {
    if (!activeDate) return;

    const prevDay = new Date(activeDate);
    prevDay.setDate(prevDay.getDate() - 1);

    setActiveDate(prevDay);
    setDayOffset((prev) => prev - 1);
  };

  const onNextDayClick = () => {
    if (!activeDate) return;

    const nextDay = new Date(activeDate);
    nextDay.setDate(nextDay.getDate() + 1);

    setActiveDate(nextDay);
    setDayOffset((prev) => prev + 1);
  };

  const dateText = useMemo(() => {
    if (activeDate.getDate() === new Date().getDate())
      return "Today, " + format(activeDate, "MMM dd");

    return format(activeDate, "PP");
  }, [activeDate]);

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <div className="inline-flex items-center justify-between gap-1 rounded-md font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <Button
          variant="outline"
          className="h-6 px-1 py-1"
          onClick={onPrevDayClick}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <PopoverTrigger asChild>
          <button>
            <div className="align-center flex grow justify-center rounded-md border border-input bg-background/[.4] px-2 py-1 align-middle hover:bg-accent hover:text-accent-foreground">
              <CalendarIcon className="mr-2 h-4 w-4 place-self-center" />
              <p className="align-middle text-sm font-bold">{dateText}</p>
            </div>
          </button>
        </PopoverTrigger>

        <Button
          variant="outline"
          className="h-6 px-1 py-1"
          onClick={onNextDayClick}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <PopoverContent className="w-auto p-0" align="center" sideOffset={-40}>
        <Calendar
          mode="single"
          selected={activeDate}
          defaultMonth={activeDate}
          onSelect={onDateSelect}
          onDayClick={(x) => console.log("day click", x)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function daysBetweenDates(startDate: Date, endDate: Date) {
  const parsedGivenDate = new Date(endDate);

  const currentTimeMillis = startDate.getTime();
  const givenTimeMillis = parsedGivenDate.getTime();

  const differenceInMillis = givenTimeMillis - currentTimeMillis;
  const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);

  return Math.round(differenceInDays);
}
