import { ChatRoom } from "src/app/models/ChatRoom";
import { MilestoneStatus, ProjectRole, ProjectStatus, TaskPriority, TaskStatus } from "./enums/enums";

export interface ProjectDetailResponse {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  isActive: boolean;
  progress: number;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  members: {
    userId: number;
    firstName: string;
    lastName: string;
    role: ProjectRole;
    joinedAt: Date;
    profilePicture: string|null;
  }[];
  tasks: {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    assignedTo: {
      firstName: string;
      lastName: string;
    };
  }[];
  milestones: {
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    status: MilestoneStatus;
  }[];
  chatRooms?:  {
    id: number;
    name: string;
    createdAt: Date;
  }[];
}