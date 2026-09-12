import { updateProject } from "@/actions/App/Http/Controllers/ProjectController";
import { DatePicker } from "@/components/date-picker";
import { Item, SelectInput } from "@/components/select-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Priority, Project, Status } from "@/types/project";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "./project-context";
import useForm from "@/hooks/use-form";
import { toast } from "sonner";

interface EditProjectProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

function EditProject({ open, onOpenChange, onSuccess }: EditProjectProps) {
    const project = useContext(ProjectContext);

    const { submit, data, setData, errors, resetAndClearErrors } = useForm<Partial<Project>>({})

    useEffect(() => {
        if (!project) {
            return;
        }

        setData({
            client_name: project.client_name,
            project_name: project.project_name,
            description: project.description ?? "",
            priority: project.priority ?? null,
            status: project.status ?? null,
            start_date: project.start_date ?? null,
            due_date: project.due_date ?? null,
        });
    }, [project]);

    async function submitForm(){
        if (!project) {
            return;
        }

        submit(updateProject(project.id), {
            onSuccess(){
                onSuccess?.();
                onOpenChange?.(false);
                toast(`Project updated successfully.`)
                resetAndClearErrors()
            }
        })
    }



    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update project details here.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 my-4 flex flex-col gap-4">
                        <Field>
                            <FieldLabel>
                                Client Name
                            </FieldLabel>
                            <Input type="text" value={data.client_name ?? ""} onChange={(e) => setData({ ...data, client_name: e.currentTarget.value })} />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Project Name
                            </FieldLabel>
                            <Input type="text" value={data.project_name ?? ""} onChange={(e) => setData({ ...data, project_name: e.currentTarget.value })} />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Description
                            </FieldLabel>
                            <Textarea value={data.description ?? ""} onChange={(e) => setData({ ...data, description: e.currentTarget.value })} />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Status
                            </FieldLabel>
                            <SelectInput
                                value={data.status ?? null}
                                items={Object.values(Status).map((status): Item => ({ value: status, label: status }))}
                                onValueChange={(value) => setData((prev) => ({ ...prev, status: (value as Status) ?? Status.Planning }))}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Priority
                            </FieldLabel>
                            <SelectInput
                                value={data.priority ?? null}
                                items={Object.values(Priority).map((priority): Item => ({ value: priority, label: priority }))}
                                onValueChange={(value) => setData((prev) => ({ ...prev, priority: (value as Priority) ?? Priority.Low }))}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Start Date
                            </FieldLabel>
                            <DatePicker value={data.start_date ?? undefined} onSelect={(v) => setData({ ...data, start_date: v ?? null })} />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Due Date
                            </FieldLabel>
                            <DatePicker value={data.due_date ?? undefined} onSelect={(v) => setData({ ...data, due_date: v ?? null })} />
                        </Field>
                    </div>
                    <DialogFooter className="flex justify-end">
                        <Button onClick={submitForm}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export { EditProject }; 