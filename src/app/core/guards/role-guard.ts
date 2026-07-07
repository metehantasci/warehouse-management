import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  UserRole
} from '../models/user-role.enum';

import {
  AuthService
} from '../services/auth';

import {
  NotificationService
} from '../services/notification';

export const roleGuard:
  CanActivateFn = (
    route
  ) => {
    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    const notification =
      inject(NotificationService);

    const allowedRoles =
      (
        route.data?.['roles']
        ?? []
      ) as readonly UserRole[];

    if (
      !authService.isAuthenticated()
    ) {
      notification.warning(
        'Bu sayfaya erişmek için önce oturum açmalısınız.',
        'Oturum Gerekli',
        4500
      );

      return router.createUrlTree(
        ['/login']
      );
    }

    if (
      allowedRoles.length === 0
    ) {
      return true;
    }

    if (
      authService.hasRole(
        allowedRoles
      )
    ) {
      return true;
    }

    const currentRole =
      authService.currentRole();

    notification.error(
      [
        'Bu sayfaya erişmek için gerekli yetkiniz bulunmuyor.',
        currentRole
          ? `Mevcut rol: ${roleLabel(currentRole)}.`
          : ''
      ]
        .filter(Boolean)
        .join(' '),
      'Yetersiz Yetki',
      5200
    );

    return router.createUrlTree(
      ['/dashboard']
    );
  };


function roleLabel(
  role: UserRole
): string {
  switch (role) {
    case UserRole.DEPO_SORUMLUSU:
      return 'Depo Sorumlusu';

    case UserRole.OPERASYON_YONETICISI:
      return 'Operasyon Yöneticisi';

    case UserRole.GORUNTULEYICI:
      return 'Görüntüleyici';

    default:
      return String(role);
  }
}
