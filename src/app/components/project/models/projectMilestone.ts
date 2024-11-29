import { MilestoneStatus } from "./enums/enums";

export interface ProjectMilestoneDetail {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  status: MilestoneStatus;
}