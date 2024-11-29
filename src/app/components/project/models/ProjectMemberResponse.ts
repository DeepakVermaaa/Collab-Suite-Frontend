import { ProjectRole } from "./enums/enums";

export interface ProjectMemberResponse {
    message: string;
    member: {
      projectId: number;
      userId: number;
      userName: string;
      role: ProjectRole;
      joinedAt: Date;
      profilePicture: string;
    };
  }