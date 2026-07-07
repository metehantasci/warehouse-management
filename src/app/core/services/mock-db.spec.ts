import {
  TestBed
} from '@angular/core/testing';

import {
  MockDbService
} from './mock-db';

import {
  StorageService
} from './storage';

interface TestEntity {
  id: string;
  name: string;
}

describe(
  'MockDbService',
  () => {
    let service:
      MockDbService;

    beforeEach(() => {
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          MockDbService,
          StorageService
        ]
      });

      service =
        TestBed.inject(
          MockDbService
        );
    });

    it(
      'should create and read an entity',
      () => {
        const entity:
          TestEntity = {
            id: '1',
            name: 'Test Product'
          };

        service.create(
          'products',
          entity
        );

        expect(
          service.getById<TestEntity>(
            'products',
            '1'
          )
        ).toEqual(entity);
      }
    );

    it(
      'should rollback a failed transaction',
      () => {
        const initial:
          TestEntity = {
            id: '1',
            name: 'Initial'
          };

        service.create(
          'products',
          initial
        );

        expect(() => {
          service.transaction(
            () => {
              service.create(
                'products',
                {
                  id: '2',
                  name: 'Temporary'
                }
              );

              throw new Error(
                'Forced failure'
              );
            }
          );
        }).toThrow();

        const items =
          service.getAll<TestEntity>(
            'products'
          );

        expect(items).toEqual([
          initial
        ]);
      }
    );

    it(
      'should reject duplicate ids',
      () => {
        service.create(
          'products',
          {
            id: '1',
            name: 'First'
          }
        );

        expect(() => {
          service.create(
            'products',
            {
              id: '1',
              name: 'Duplicate'
            }
          );
        }).toThrow();
      }
    );
  }
);
