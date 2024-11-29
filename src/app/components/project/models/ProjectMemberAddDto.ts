import { ProjectRole } from "./enums/enums";

export interface ProjectMemberAddDto {
    userId: number;
    role: ProjectRole;
  }