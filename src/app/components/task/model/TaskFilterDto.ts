import { TaskStatus, TaskPriority } from "../../project/models/enums/enums";

export interface TaskFilterDto {
    pageNumber: number;
    pageSize: number;
    
    // Core Filters
    searchQuery?: string;
    status?: TaskStatus | null;
    priority?: number | null;
    projectId?: number | null;
    
    // Assignment Filters
    assignedToMe: boolean;
    createdByMe: boolean;
    
    // Date Range
    dueDateFrom?: Date | null;
    dueDateTo?: Date | null;
    
    // Sorting
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';

    // View Type
    view?: 'list' | 'kanban';
}