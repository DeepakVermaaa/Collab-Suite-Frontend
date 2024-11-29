export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
  organizationId?: number
}