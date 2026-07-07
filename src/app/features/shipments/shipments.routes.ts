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
  ShipmentDetail
} from './pages/shipment-detail/shipment-detail';

import {
  ShipmentForm
} from './pages/shipment-form/shipment-form';

import {
  ShipmentList
} from './pages/shipment-list/shipment-list';

export const SHIPMENTS_ROUTES:
  Routes = [
    {
      path: '',
      component: ShipmentList
    },
    {
      path: 'yeni',
      component: ShipmentForm,
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
      component: ShipmentDetail
    }
  ];
