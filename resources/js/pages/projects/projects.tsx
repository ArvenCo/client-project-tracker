import { Head } from '@inertiajs/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { getProjects, index } from '@/actions/App/Http/Controllers/ProjectController';
import { Project } from '@/types/project';
import { format } from 'date-fns';
import { CreateProject } from './create-project';

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);

    async function fetchProjects() {
        try {
            const response = await fetch(getProjects.url());
            const result = (await response.json()) as Project[];
            setProjects(result);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className='flex justify-end'>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.client_name}</TableCell>
                                <TableCell>{p.project_name}</TableCell>
                                <TableCell>{p.status}</TableCell>
                                <TableCell>{p.priority}</TableCell>
                                <TableCell>{p.start_date ? format(p.start_date, 'PPP') : ''}</TableCell>
                                <TableCell>{p.due_date ? format(p.due_date, 'PPP') : ''}</TableCell>
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
