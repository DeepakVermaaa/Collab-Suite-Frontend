export interface ProjectMilestone {
    id: number;
    title: string;
    dueDate: Date;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Delayed';
  }
  