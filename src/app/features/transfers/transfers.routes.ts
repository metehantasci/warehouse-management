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
  unsavedChangesGuard
} from '../../core/guards/unsaved-changes-guard';

import {
  TransferDetail
} from './pages/transfer-detail/transfer-detail';

import {
  TransferForm
} from './pages/transfer-form/transfer-form';

import {
  TransferList
} from './pages/transfer-list/transfer-list';

export const TRANSFERS_ROUTES:
  Routes = [
    {
      path: '',
      component: TransferList
    },
    {
      path: 'yeni',
      component: TransferForm,
      canActivate: [
        roleGuard
      ],
      canDeactivate: [
        unsavedChangesGuard
      ],
      data: {
        roles: [
          UserRole.DEPO_SORUMLUSU,
          UserRole.OPERASYON_YONETICISI
        ]
      }
    },
    {
      path: ':id',
      component: TransferDetail
    }
  ];
