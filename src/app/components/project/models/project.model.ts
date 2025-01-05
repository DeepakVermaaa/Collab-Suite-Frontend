import { DocumentModel } from "../../document-management/models/document.models";
import { ProjectStatus } from "./enums/enums";
import { ProjectMember } from "./projectMember";
import { ProjectMilestoneDetail } from "./projectMilestone";

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
  milestones: ProjectMilestoneDetail[];
  documents?: DocumentModel[];
  progress: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  status: ProjectStatus;
}