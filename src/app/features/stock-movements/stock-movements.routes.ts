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
  StockMovementDetail
} from './pages/stock-movement-detail/stock-movement-detail';

import {
  StockMovementForm
} from './pages/stock-movement-form/stock-movement-form';

import {
  StockMovementList
} from './pages/stock-movement-list/stock-movement-list';

export const STOCK_MOVEMENTS_ROUTES:
  Routes = [
    {
      path: '',
      component: StockMovementList
    },
    {
      path: 'yeni',
      component: StockMovementForm,
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
      component: StockMovementDetail
    }
  ];
