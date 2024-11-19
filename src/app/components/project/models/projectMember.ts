export interface ProjectMember {
    userId: number;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Manager' | 'Member' | 'Viewer';
    joinedAt: Date;
  }