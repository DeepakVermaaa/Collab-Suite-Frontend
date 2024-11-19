import { Project } from "../components/project/models/project.model";
import { ProjectGroup } from "./ProjectGroup";

export interface ChatRoom {
    id: number;
    projectGroupId: number;
    name: string;
    createdAt: Date;
    projectGroup?: Project;
  }