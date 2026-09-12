import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChangeEvent } from "react";

export interface SearchInputProps {
  onChange?: (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  triggerSearchEvent?: () => void
}
export function SearchInput({ onChange, triggerSearchEvent }: SearchInputProps){
    return<>
    <InputGroup className="max-w-xs">
      <InputGroupInput
        placeholder="Search..."
        onChange={onChange}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            triggerSearchEvent?.();
          }
        }}
      />
        <InputGroupAddon>
            <Search />
        </InputGroupAddon>
    </InputGroup>
    </>;
}