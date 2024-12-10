export enum TaskStatus {
    Todo = 0,
    InProgress = 1,
    UnderReview = 2,
    Completed = 3
}

export enum TaskPriority {
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

export enum MilestoneStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Delayed = 3
}

export enum ProjectStatus {
    Planning = 0,
    Active = 1,
    OnHold = 2,
    Completed = 3,
    Cancelled = 4
}

export enum ProjectRole {
    Admin = 0,
    Manager = 1,
    Member = 2,
    Viewer = 3
}

// Helper functions to get display text and styling
export const getTaskStatusInfo = (status: TaskStatus) => {
    const statusMap = {
        [TaskStatus.Todo]: {
            text: 'To Do',
            classes: 'bg-gray-100 text-gray-800'
        },
        [TaskStatus.InProgress]: {
            text: 'In Progress',
            classes: 'bg-blue-100 text-blue-800'
        },
        [TaskStatus.UnderReview]: {
            text: 'Under Review',
            classes: 'bg-yellow-100 text-yellow-800'
        },
        [TaskStatus.Completed]: {
            text: 'Completed',
            classes: 'bg-green-100 text-green-800'
        }
    };
    return statusMap[status] || { text: 'Unknown', classes: 'bg-gray-100 text-gray-800' };
};

export const getTaskPriorityInfo = (priority: TaskPriority) => {
    const priorityMap = {
        [TaskPriority.Low]: {
            text: 'Low',
            classes: 'bg-gray-100 text-gray-800',
            icon: 'arrow_downward'
        },
        [TaskPriority.Medium]: {
            text: 'Medium',
            classes: 'bg-blue-100 text-blue-800',
            icon: 'remove'
        },
        [TaskPriority.High]: {
            text: 'High',
            classes: 'bg-orange-100 text-orange-800',
            icon: 'arrow_upward'
        },
        [TaskPriority.Urgent]: {
            text: 'Urgent',
            classes: 'bg-red-100 text-red-800',
            icon: 'priority_high'
        }
    };
    return priorityMap[priority] || { 
        text: 'Unknown', 
        classes: 'bg-gray-100 text-gray-800', 
        icon: 'help_outline' 
    };
};