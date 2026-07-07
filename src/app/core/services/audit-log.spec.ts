import {
  TestBed
} from '@angular/core/testing';

import {
  AuditActionType
} from '../models/audit-action-type.enum';

import {
  UserRole
} from '../models/user-role.enum';

import {
  AuditLogService
} from './audit-log';

import {
  AuthService
} from './auth';

import {
  IdGeneratorService
} from './id-generator';

import {
  MockDbService
} from './mock-db';

import {
  StorageService
} from './storage';

describe(
  'AuditLogService',
  () => {
    let service:
      AuditLogService;

    beforeEach(() => {
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          AuditLogService,
          AuthService,
          IdGeneratorService,
          MockDbService,
          StorageService
        ]
      });

      service =
        TestBed.inject(
          AuditLogService
        );
    });

    it(
      'should create a rich audit entry',
      () => {
        const entry =
          service.record({
            action:
              AuditActionType.CREATE,

            entityType:
              'Product',

            entityId:
              'product-1',

            description:
              'Ürün oluşturuldu.',

            oldValue:
              null,

            newValue: {
              name: 'Test Ürün'
            },

            actor: {
              userId:
                'user-test',

              userName:
                'Test Kullanıcı',

              userRole:
                UserRole.OPERASYON_YONETICISI
            }
          });

        expect(
          entry.entityId
        ).toBe(
          'product-1'
        );

        expect(
          service.totalCount()
        ).toBe(1);

        expect(
          service.entries()[0]
            .description
        ).toBe(
          'Ürün oluşturuldu.'
        );
      }
    );

    it(
      'should persist audit entries',
      () => {
        service.record({
          action:
            AuditActionType.UPDATE,

          entityType:
            'Warehouse',

          entityId:
            'warehouse-1',

          description:
            'Depo güncellendi.',

          actor: {
            userId:
              'user-test',

            userName:
              'Test Kullanıcı',

            userRole:
              UserRole.OPERASYON_YONETICISI
          }
        });

        const db =
          TestBed.inject(
            MockDbService
          );

        expect(
          db.count('auditLog')
        ).toBe(1);
      }
    );
  }
);
