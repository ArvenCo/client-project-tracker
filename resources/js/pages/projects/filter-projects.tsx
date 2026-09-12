import { SelectInput } from "@/components/select-input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Priority, Status } from "@/types/project";
import { useState } from "react";

export type ProjectFilters = {
    status?: Status | null;
    priority?: Priority | null;
};

interface FilterProjectsProps {
    value?: ProjectFilters;
    onApply?: (filters: ProjectFilters) => void;
    onReset?: () => void;
}

export function FilterProjects({ value, onApply, onReset }: FilterProjectsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<ProjectFilters>({
        status: value?.status ?? null,
        priority: value?.priority ?? null,
    });

    function syncFilters(nextValue?: ProjectFilters) {
        setFilters({
            status: nextValue?.status ?? null,
            priority: nextValue?.priority ?? null,
        });
    }

    function applyFilters() {
        const nextFilters = {
            status: filters.status ?? null,
            priority: filters.priority ?? null,
        };

        onApply?.(nextFilters);
        setIsOpen(false);
    }

    function clearFilters() {
        const nextFilters = { status: null, priority: null };
        syncFilters(nextFilters);
        onReset?.();
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                syncFilters(value);
            }
        }}>
            <DialogTrigger asChild >
                <Button variant="secondary">Filter</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Filter projects</DialogTitle>
                    <DialogDescription>
                        Narrow the project list by status or priority.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 flex flex-col gap-4">

                    <Field>
                        <FieldLabel>Status</FieldLabel>
                        <SelectInput
                            value={filters.status ?? null}
                            items={Object.values(Status).map((status) => ({
                                value: status,
                                label: status,
                            }))}
                            onValueChange={(value) => setFilters((prev) => ({
                                ...prev,
                                status: (value as Status | null) ?? null,
                            }))}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Priority</FieldLabel>
                        <SelectInput
                            value={filters.priority ?? null}
                            items={Object.values(Priority).map((priority) => ({
                                value: priority,
                                label: priority,
                            }))}
                            onValueChange={(value) => setFilters((prev) => ({
                                ...prev,
                                priority: (value as Priority | null) ?? null,
                            }))}
                        />
                    </Field>
                </div>

                <DialogFooter className="flex justify-end gap-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={clearFilters}>
                        Clear
                    </Button>
                    <Button type="button" onClick={applyFilters}>
                        Apply filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}