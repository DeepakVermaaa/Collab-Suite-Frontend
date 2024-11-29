import { TaskStatus, TaskPriority } from "./enums/enums";

export interface ProjectTaskDetail {
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
  }