import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChangeEvent, useState } from "react";

export interface SearchInputProps {
  onChange?: (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  onApply?: () => void
}
export function SearchInput({ onChange, onApply }: SearchInputProps){
    const [value, setValue] = useState<string>("");
    return<>
    <InputGroup className="max-w-xs">
      <InputGroupInput
        value={value}
        placeholder="Search..."
        onChange={(e) => {setValue(e.target.value); onChange?.(e)}}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onApply?.();
          }
        }}
      />
        <InputGroupAddon>
            <Search />
        </InputGroupAddon>
    </InputGroup>
    </>;
}