import { Project } from "../components/project/models/project.model";

export interface ProjectsResponse {
    data: Project[];
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
  }
  