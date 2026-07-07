import {
  TestBed
} from '@angular/core/testing';

import {
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

import {
  roleGuard
} from './role-guard';

describe(
  'roleGuard',
  () => {
    let currentRole:
      UserRole;

    let authenticated:
      boolean;

    const routerMock = {
      createUrlTree:
        (
          commands:
            readonly string[]
        ) => ({
          commands
        })
    };

    const notificationMock = {
      error:
        () => {},

      warning:
        () => {}
    };

    const authMock = {
      isAuthenticated:
        () =>
          authenticated,

      hasRole:
        (
          roles:
            readonly UserRole[]
        ) =>
          roles.includes(
            currentRole
          ),

      currentRole:
        () =>
          currentRole
    };

    beforeEach(() => {
      currentRole =
        UserRole.GORUNTULEYICI;

      authenticated =
        true;

      TestBed.configureTestingModule({
        providers: [
          {
            provide:
              AuthService,

            useValue:
              authMock
          },
          {
            provide:
              Router,

            useValue:
              routerMock
          },
          {
            provide:
              NotificationService,

            useValue:
              notificationMock
          }
        ]
      });
    });

    it(
      'allows authorized role',
      () => {
        currentRole =
          UserRole.OPERASYON_YONETICISI;

        const result =
          TestBed.runInInjectionContext(
            () =>
              roleGuard(
                {
                  data: {
                    roles: [
                      UserRole
                        .OPERASYON_YONETICISI
                    ]
                  }
                } as never,

                {} as never
              )
          );

        expect(result).toBe(true);
      }
    );

    it(
      'redirects unauthorized role',
      () => {
        currentRole =
          UserRole.GORUNTULEYICI;

        const result =
          TestBed.runInInjectionContext(
            () =>
              roleGuard(
                {
                  data: {
                    roles: [
                      UserRole
                        .OPERASYON_YONETICISI
                    ]
                  }
                } as never,

                {} as never
              )
          );

        expect(result).toEqual({
          commands: [
            '/dashboard'
          ]
        });
      }
    );

    it(
      'redirects unauthenticated user to login',
      () => {
        authenticated =
          false;

        const result =
          TestBed.runInInjectionContext(
            () =>
              roleGuard(
                {
                  data: {
                    roles: [
                      UserRole
                        .OPERASYON_YONETICISI
                    ]
                  }
                } as never,

                {} as never
              )
          );

        expect(result).toEqual({
          commands: [
            '/login'
          ]
        });
      }
    );
  }
);
