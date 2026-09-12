import { SelectSharedProps } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


export type Item = {
    value: string|number;
    label: string;
}

interface SelectInputProps extends Omit<SelectSharedProps, 'value' | 'onValueChange'> {
    items: Item[];
    value?: string | null;
    onValueChange?: (value: string | null) => void;
}

function SelectInput({ items, value, onValueChange, ...props }: SelectInputProps){
    return(
        <Select value={value ?? undefined} onValueChange={onValueChange} {...props}>
            <SelectTrigger>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent >
                {items.map((item) => (
                    <SelectItem key={String(item.value)} value={String(item.value)}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export { SelectInput }