import { ProjectStatus } from "../components/project/models/enums/enums";

export interface ProjectGroup {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    createdById: number;
    status: ProjectStatus;
    startDate: Date,
    endDate: Date,
    isActive: boolean;
  }