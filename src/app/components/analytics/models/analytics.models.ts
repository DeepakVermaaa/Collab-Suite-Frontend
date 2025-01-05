export interface OverviewAnalytics {
    totalProjects: number;
    totalTasks: number;
    completedProjects: number;
    completedTasks: number;
    projectCompletionRate: number;
    taskCompletionRate: number;
  }
  
  export interface TasksDistribution {
    tasksByStatus: Array<{ status: string; count: number }>;
    tasksByPriority: Array<{ priority: string; count: number }>;
  }
  
  export interface TeamPerformance {
    userId: number;
    userName: string;
    totalTasks: number;
    completedTasks: number;
  }