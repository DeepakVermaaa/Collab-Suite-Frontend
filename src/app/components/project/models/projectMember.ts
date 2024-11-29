import { ProjectRole } from "./enums/enums";

export interface ProjectMember {
    userId: number;
    firstName: string;
    lastName: string;
    role: ProjectRole;
    joinedAt: Date;
  }