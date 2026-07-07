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
  WarehouseDetail
} from './pages/warehouse-detail/warehouse-detail';

import {
  WarehouseForm
} from './pages/warehouse-form/warehouse-form';

import {
  WarehouseList
} from './pages/warehouse-list/warehouse-list';

const CRUD_ROLES = [
  UserRole.DEPO_SORUMLUSU,
  UserRole.OPERASYON_YONETICISI
];

export const WAREHOUSES_ROUTES:
  Routes = [
    {
      path: '',
      component: WarehouseList
    },
    {
      path: 'yeni',
      component: WarehouseForm,
      canActivate: [
        roleGuard
      ],
      canDeactivate: [
        unsavedChangesGuard
      ],
      data: {
        roles: CRUD_ROLES
      }
    },
    {
      path: ':id/edit',
      component: WarehouseForm,
      canActivate: [
        roleGuard
      ],
      canDeactivate: [
        unsavedChangesGuard
      ],
      data: {
        roles: CRUD_ROLES
      }
    },
    {
      path: ':id',
      component: WarehouseDetail
    }
  ];
