export enum Status {
    Planning = "Planning",
    InProgress = "In Progress",
    OnHold = "On Hold",
    Completed = "Completed",
}

export enum Priority {
    Low = "Low",
    Medium = "Medium",
    High = "High",
}

export type Project = {
    id: number;
    client_name: string;
    description?: string;
    project_name: string;
    status: Status|null;
    priority: Priority;
    start_date: Date|null;
    due_date: Date|null;
}
