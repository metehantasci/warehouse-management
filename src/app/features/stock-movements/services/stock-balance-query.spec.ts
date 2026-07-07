import {
  TestBed
} from '@angular/core/testing';

import {
  MovementType
} from '../../../core/models/movement-type.enum';

import {
  UserRole
} from '../../../core/models/user-role.enum';

import {
  StockMovement
} from '../models/stock-movement';

import {
  StockBalanceQueryService
} from './stock-balance-query';


describe(
  'StockBalanceQueryService',
  () => {

    let service:
      StockBalanceQueryService;


    beforeEach(() => {

      TestBed.configureTestingModule({
        providers: [
          StockBalanceQueryService
        ]
      });


      service =
        TestBed.inject(
          StockBalanceQueryService
        );
    });


    it(
      'should calculate IN and OUT movements correctly',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            type: MovementType.IN,
            quantity: 20,
            previousBalance: 0,
            newBalance: 20,
            createdAt: '2026-01-01T10:00:00.000Z'
          }),

          movement({
            id: 'm2',
            type: MovementType.OUT,
            quantity: 7,
            previousBalance: 20,
            newBalance: 13,
            createdAt: '2026-01-02T10:00:00.000Z'
          })
        ];


        expect(
          service.calculateBalance(
            movements,
            'product-1',
            'warehouse-1'
          )
        ).toBe(13);
      }
    );


    it(
      'should ignore cancelled movements',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            type: MovementType.IN,
            quantity: 10,
            previousBalance: 0,
            newBalance: 10,
            createdAt: '2026-01-01T10:00:00.000Z'
          }),

          movement({
            id: 'm2',
            type: MovementType.OUT,
            quantity: 8,
            previousBalance: 10,
            newBalance: 2,
            isCancelled: true,
            createdAt: '2026-01-02T10:00:00.000Z'
          })
        ];


        expect(
          service.calculateBalance(
            movements,
            'product-1',
            'warehouse-1'
          )
        ).toBe(10);
      }
    );


    it(
      'should treat ADJUSTMENT as absolute target balance',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            type: MovementType.IN,
            quantity: 10,
            previousBalance: 0,
            newBalance: 10,
            createdAt: '2026-01-01T10:00:00.000Z'
          }),

          movement({
            id: 'm2',
            type: MovementType.OUT,
            quantity: 5,
            previousBalance: 10,
            newBalance: 5,
            isCancelled: true,
            createdAt: '2026-01-02T10:00:00.000Z'
          }),

          movement({
            id: 'm3',
            type: MovementType.ADJUSTMENT,
            quantity: 2,
            previousBalance: 5,
            newBalance: 7,
            createdAt: '2026-01-03T10:00:00.000Z'
          })
        ];


        expect(
          service.calculateBalance(
            movements,
            'product-1',
            'warehouse-1'
          )
        ).toBe(7);
      }
    );


    it(
      'should calculate product and warehouse balances independently',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            productId: 'product-1',
            warehouseId: 'warehouse-1',
            type: MovementType.IN,
            quantity: 10,
            previousBalance: 0,
            newBalance: 10,
            createdAt: '2026-01-01T10:00:00.000Z'
          }),

          movement({
            id: 'm2',
            productId: 'product-1',
            warehouseId: 'warehouse-2',
            type: MovementType.IN,
            quantity: 20,
            previousBalance: 0,
            newBalance: 20,
            createdAt: '2026-01-01T11:00:00.000Z'
          }),

          movement({
            id: 'm3',
            productId: 'product-2',
            warehouseId: 'warehouse-1',
            type: MovementType.IN,
            quantity: 30,
            previousBalance: 0,
            newBalance: 30,
            createdAt: '2026-01-01T12:00:00.000Z'
          })
        ];


        expect(
          service.calculateProductTotal(
            movements,
            'product-1'
          )
        ).toBe(30);


        expect(
          service.calculateWarehouseTotal(
            movements,
            'warehouse-1'
          )
        ).toBe(40);
      }
    );


    it(
      'should detect sufficient and insufficient stock',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            type: MovementType.IN,
            quantity: 15,
            previousBalance: 0,
            newBalance: 15,
            createdAt: '2026-01-01T10:00:00.000Z'
          })
        ];


        expect(
          service.hasSufficientStock(
            movements,
            'product-1',
            'warehouse-1',
            15
          )
        ).toBe(true);


        expect(
          service.hasSufficientStock(
            movements,
            'product-1',
            'warehouse-1',
            16
          )
        ).toBe(false);
      }
    );


    it(
      'should expose latest active movement date',
      () => {

        const movements: StockMovement[] = [
          movement({
            id: 'm1',
            type: MovementType.IN,
            quantity: 10,
            previousBalance: 0,
            newBalance: 10,
            createdAt: '2026-01-01T10:00:00.000Z'
          }),

          movement({
            id: 'm2',
            type: MovementType.OUT,
            quantity: 2,
            previousBalance: 10,
            newBalance: 8,
            isCancelled: true,
            createdAt: '2026-01-03T10:00:00.000Z'
          }),

          movement({
            id: 'm3',
            type: MovementType.OUT,
            quantity: 1,
            previousBalance: 10,
            newBalance: 9,
            createdAt: '2026-01-02T10:00:00.000Z'
          })
        ];


        expect(
          service.getLastMovementAt(
            movements,
            'product-1',
            'warehouse-1'
          )
        ).toBe(
          '2026-01-02T10:00:00.000Z'
        );
      }
    );
  }
);


function movement(
  overrides:
    Partial<StockMovement>
): StockMovement {

  return {
    id: 'movement-default',

    productId:
      'product-1',

    warehouseId:
      'warehouse-1',

    type:
      MovementType.IN,

    quantity:
      1,

    previousBalance:
      0,

    newBalance:
      1,

    performedByUserId:
      'user-1',

    performedByRole:
      UserRole.DEPO_SORUMLUSU,

    reason:
      'Test hareketi',

    createdAt:
      '2026-01-01T10:00:00.000Z',

    updatedAt:
      '2026-01-01T10:00:00.000Z',

    isCancelled:
      false,

    ...overrides
  };
}
