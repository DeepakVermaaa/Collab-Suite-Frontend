import { ProjectStatus } from "./enums/enums";

export interface ProjectCreateDto {
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    status: ProjectStatus
}