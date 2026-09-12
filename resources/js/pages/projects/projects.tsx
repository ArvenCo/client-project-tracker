import { Head } from '@inertiajs/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { getProjects, index } from '@/actions/App/Http/Controllers/ProjectController';
import { Project } from '@/types/project';
import { format } from 'date-fns';
import { CreateProject } from './create-project';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Ellipsis, Eye, PencilLine, Trash2 } from 'lucide-react';
import { EditProject } from './edit-project';
import { ProjectContext } from './project-context';
import { DeleteProject } from './delete-project';
import { SearchInput } from '@/components/search-input';
import { toast } from 'sonner';

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);

    async function fetchProjects() {
        try {
            const response = await fetch(getProjects.url());
            const result = (await response.json()) as Project[];
            setProjects(result);
        } catch (err) {
            toast.error('Failed to fetch projects', { });
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className='flex justify-end gap-4'>
                    
                    <SearchInput />
                    <CreateProject onSuccess={fetchProjects}/>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.client_name}</TableCell>
                                <TableCell>{project.project_name}</TableCell>
                                <TableCell>{project.status}</TableCell>
                                <TableCell>{project.priority}</TableCell>
                                <TableCell>{project.start_date ? format(project.start_date, 'PPP') : ''}</TableCell>
                                <TableCell>{project.due_date ? format(project.due_date, 'PPP') : ''}</TableCell>
                                <TableCell>
                                    <ProjectContext.Provider value={project}>
                                        <ActionDropdownMenu onSuccess={fetchProjects}/>
                                    </ProjectContext.Provider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

Projects.layout = {
    breadcrumbs: [{
        title: 'Projects',
        href: index(),
    }],
};


interface ActionDropdownMenuProps {
    onSuccess?: () => void,
}

function ActionDropdownMenu({ onSuccess }: ActionDropdownMenuProps ) {
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open project actions"
                    className="size-8"
                >
                    <Ellipsis className="size-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">

                <DropdownMenuItem
                    onClick={() => {
                        setIsEditProjectOpen(true);
                    }}
                >
                    <PencilLine className="size-4" />
                    Edit
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                        setIsDeleteProjectOpen(true);
                    }}
                >
                    <Trash2 className="size-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <EditProject
            open={isEditProjectOpen}
            onOpenChange={(open) => {
                setIsEditProjectOpen(open)
            }}
            onSuccess={() => {
                setIsEditProjectOpen(false);
                onSuccess?.()
            }}
        />
        <DeleteProject
            open={isDeleteProjectOpen}
            onOpenChange={(open) => {
                setIsDeleteProjectOpen(open)
            }}
            onSuccess={() => {
                setIsDeleteProjectOpen(false);
                onSuccess?.()
            }}
        />
    </>;
}
