import { createProject } from "@/actions/App/Http/Controllers/ProjectController";
import { DatePicker } from "@/components/date-picker";
import { Item, SelectInput } from "@/components/select-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useForm from "@/hooks/use-form";
import { Priority, Project, Status } from "@/types/project";
import { useState } from "react";
import { toast } from "sonner";

interface CreateProjectProps {
    onSuccess?: () => void
}

function CreateProject({ onSuccess }: CreateProjectProps){
    

    const { data, setData, submit, errors, resetAndClearErrors } = useForm<Partial<Project>>({
        client_name: "",
        project_name: "",
        description: "",
        priority: Priority.Low,
        start_date: null,
        due_date: null,
    })
    const [isOpen, setIsOpen] = useState(false);

    function submitForm(){
        submit(createProject(), {
            onSuccess() {
                onSuccess?.();
                setIsOpen(false);
                resetAndClearErrors();
                toast.success("Project created successfully.");
                
            },
        });
    }

    return (<>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild >
                <Button>Create Project</Button>
            </DialogTrigger>
                
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new Project</DialogTitle>
                    <DialogDescription>
                        Create a project with client's name here.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2 my-4 flex flex-col gap-4">
                    <Field>
                        <FieldLabel>
                            Client Name
                        </FieldLabel>
                        <Input type="text" onChange={(e) => setData({ ...data, client_name: e.currentTarget.value })} aria-invalid={errors.client_name != undefined}/>
                        <FieldError children={errors.client_name} />
                    </Field>
                    <Field>
                        <FieldLabel>
                            Project Name
                        </FieldLabel>
                        <Input type="text" onChange={(e) => setData({ ...data, project_name: e.currentTarget.value })} aria-invalid={errors.project_name != undefined}/>
                        <FieldError children={errors.project_name} />
                    </Field>
                    <Field>
                        <FieldLabel>
                            Description
                        </FieldLabel>
                        <Textarea value={data.description ?? ""} onChange={(e) => setData({ ...data, description: e.currentTarget.value })}/>
                        <FieldError children={errors.description} />
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
                        <FieldError children={errors.status} />
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
                        <FieldError children={errors.priority} />
                    </Field>
                    <Field>
                        <FieldLabel>
                            Start Date
                        </FieldLabel>
                        <DatePicker onSelect={(v) => setData({ ...data, start_date: v})}/>
                        <FieldError children={errors.start_date} />
                    </Field>
                    <Field>
                        <FieldLabel>
                            Due Date
                        </FieldLabel>
                        <DatePicker onSelect={(v) => setData({ ...data, due_date: v})} aria-invalid={errors.due_date != undefined}/>
                        <FieldError children={errors.due_date} />
                    </Field>
                </div>
                <DialogFooter className="flex justify-end">
                    <Button onClick={submitForm}>Submit</Button>
                </DialogFooter>
            </DialogContent>
            
        </Dialog>
    </>);
}

export { CreateProject }