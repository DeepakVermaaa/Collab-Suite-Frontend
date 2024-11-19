// project.model.ts
import { ProjectMember } from "./projectMember";
import { ProjectMilestone } from "./projectMilestone";

export enum ProjectStatus {
  Planning = 0,
  Active = 1,
  OnHold = 2,
  Completed = 3,
  Cancelled = 4
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  members: ProjectMember[];
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  milestones: ProjectMilestone[];
  progress: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  status: ProjectStatus;
}