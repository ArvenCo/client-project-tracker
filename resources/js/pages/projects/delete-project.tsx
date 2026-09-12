import { deleteProject } from "@/actions/App/Http/Controllers/ProjectController";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { ProjectContext } from "./project-context";
import useForm from "@/hooks/use-form";

interface DeleteProjectProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

function DeleteProject({ open, onOpenChange, onSuccess }: DeleteProjectProps) {
    const project = useContext(ProjectContext);
    const { submit  } = useForm<{}>({});
    const [confirmation, setConfirmation] = useState("");

    const isConfirmed = !!project && confirmation.trim() === project.project_name;



    async function submitForm() {
        if (!project || !isConfirmed) {
            return;
        }

        submit(deleteProject(project.id), {
            onSuccess() {
                onSuccess?.();
                onOpenChange?.(false);
                setConfirmation("");
            },
        })

    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setConfirmation("");
                }
                onOpenChange?.(nextOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Type <span className="font-semibold text-foreground">{project?.project_name ?? "this project name"}</span> to confirm deletion.
                    </p>

                    <Input
                        type="text"
                        value={confirmation}
                        placeholder={project?.project_name ?? "Enter project name"}
                        onChange={(e) => setConfirmation(e.currentTarget.value)}
                    />
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" disabled={!isConfirmed} onClick={submitForm}>
                        Delete Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { DeleteProject };