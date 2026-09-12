import { Project } from "@/types/project";
import { createContext } from "react";

export const ProjectContext = createContext<Project | null>(null);
