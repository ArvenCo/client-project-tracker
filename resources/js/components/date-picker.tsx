import { cn } from "cn"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"

interface DatePickerProps {
    value?: Date;
    onSelect?: (value?: Date) => void
}
export function DatePicker({ value, onSelect }: DatePickerProps) {
  const [date, setDate] = useState<Date>()

    useEffect(() => {
        if (value){
            setDate(value)
        }
    }, [value])
 
  return (
    <Popover>
      <PopoverTrigger
          asChild
      >
        <Button
          variant="outline"
          data-empty={!date}
          className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
        
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={(v) => {setDate(v), onSelect?.(v) }} />
      </PopoverContent>
    </Popover>
  )
}