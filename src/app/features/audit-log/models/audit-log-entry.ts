import { AuditActionType } from '../../../core/models/audit-action-type.enum';
import { UserRole } from '../../../core/models/user-role.enum';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
}
