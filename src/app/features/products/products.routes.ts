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
  ProductDetail
} from './pages/product-detail/product-detail';

import {
  ProductForm
} from './pages/product-form/product-form';

import {
  ProductList
} from './pages/product-list/product-list';

const CRUD_ROLES = [
  UserRole.DEPO_SORUMLUSU,
  UserRole.OPERASYON_YONETICISI
];

export const PRODUCTS_ROUTES:
  Routes = [
    {
      path: '',
      component: ProductList
    },
    {
      path: 'yeni',
      component: ProductForm,
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
      component: ProductForm,
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
      component: ProductDetail
    }
  ];
