import {
  Injectable,
  computed,
  inject
} from '@angular/core';

import {
  UserRole
} from '../models/user-role.enum';

import {
  AuthService
} from './auth';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private readonly auth =
    inject(AuthService);

  readonly role =
    this.auth.currentRole;

  readonly isViewer =
    computed(
      () =>
        this.role() ===
        UserRole.GORUNTULEYICI
    );

  readonly isWarehouseManager =
    computed(
      () =>
        this.role() ===
        UserRole.DEPO_SORUMLUSU
    );

  readonly isOperationsManager =
    computed(
      () =>
        this.role() ===
        UserRole.OPERASYON_YONETICISI
    );

  readonly canManageMasterData =
    computed(
      () =>
        this.isOperationsManager()
    );

  readonly canCreateOperations =
    computed(
      () =>
        this.isWarehouseManager()
        ||
        this.isOperationsManager()
    );

  readonly canApproveOperations =
    computed(
      () =>
        this.isOperationsManager()
    );

  readonly canViewAuditLog =
    computed(
      () =>
        this.isOperationsManager()
    );
}
