import { UserRole } from './user-role.enum';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
