export interface DocumentResponse {
    data: DocumentModel[];
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
}

export interface DocumentModel {
    id: number;
    name: string;
    description: string;
    fileExtension: string;
    fileSize: number;
    uploadedAt: string;
    project: {
        id: number;
        name: string;
    };
    uploadedBy: {
        firstName: string;
        lastName: string;
        profilePicture: string;
    };
    latestVersion: number;
    currentVersionId: number;
    permissions: DocumentPermission[];
    currentUserPermission?: DocumentPermissionLevel;
}

export interface DocumentVersion {
    id: number;
    versionNumber: number;
    fileSize: number;
    fileExtension: string;
    uploadedAt: string;
    comment?: string;
    uploadedBy: {
        firstName: string;
        lastName: string;
        profilePicture: string;
    };
}

export interface DocumentPermission {
    userId: number;
    permissionLevel: DocumentPermissionLevel;
    user: {
        firstName: string;
        lastName: string;
        email?: string;
    };
}

export interface DocumentFilterParams {
    projectId?: number;
    searchQuery?: string;
    fileType?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface DocumentUploadRequest {
    file: File;
    projectId: number;
    name?: string;
    description?: string;
    comment?: string;
}

export interface DocumentUpdateRequest {
    file: File;
    comment?: string;
}

export enum DocumentPermissionLevel {
    View = 0,
    Download = 1,
    Edit = 2,
    Owner = 3
}