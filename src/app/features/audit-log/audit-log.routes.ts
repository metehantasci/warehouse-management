import {
  Routes
} from '@angular/router';

import {
  UserRole
} from '../../core/models/user-role.enum';

import {
  roleGuard
} from '../../core/guards/role-guard';

import {
  AuditLog
} from './pages/audit-log/audit-log';

export const AUDIT_LOG_ROUTES:
  Routes = [
    {
      path: '',
      component: AuditLog,
      canActivate: [
        roleGuard
      ],
      data: {
        roles: [
          UserRole.OPERASYON_YONETICISI
        ]
      }
    }
  ];
