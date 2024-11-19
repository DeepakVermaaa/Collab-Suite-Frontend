import { ProjectStatus } from "./project.model";

export interface ProjectCreateDto{
    name: string,
    description: string,
    startDate: Date,
    endDate: Date, 
    status: ProjectStatus
}