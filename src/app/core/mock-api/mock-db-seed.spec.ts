import {
  TestBed
} from '@angular/core/testing';

import {
  MockDbSeedService
} from './mock-db-seed';

import {
  LowStockRule
} from '../../features/critical-stock/models/low-stock-rule';

import {
  Product
} from '../../features/products/models/product';

import {
  StockMovement
} from '../../features/stock-movements/models/stock-movement';

import {
  TransferRequest
} from '../../features/transfers/models/transfer-request';

import {
  Warehouse
} from '../../features/warehouses/models/warehouse';

import {
  MockDbService
} from '../services/mock-db';

import {
  StorageService
} from '../services/storage';


describe(
  'MockDbSeedService',
  () => {
    let seedService:
      MockDbSeedService;

    let db:
      MockDbService;


    beforeEach(() => {
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          MockDbSeedService,
          MockDbService,
          StorageService
        ]
      });

      seedService =
        TestBed.inject(
          MockDbSeedService
        );

      db =
        TestBed.inject(
          MockDbService
        );
    });


    it(
      'should seed multiple realistic collections',
      () => {
        seedService.seedIfNeeded();

        expect(
          db.getAll<Product>('products').length
        ).toBeGreaterThanOrEqual(10);

        expect(
          db.getAll<Warehouse>('warehouses').length
        ).toBeGreaterThanOrEqual(4);

        expect(
          db.getAll<StockMovement>('stockMovements').length
        ).toBeGreaterThanOrEqual(20);

        expect(
          db.getAll<TransferRequest>('transferRequests').length
        ).toBeGreaterThanOrEqual(3);

        expect(
          db.getAll<LowStockRule>('lowStockRules').length
        ).toBeGreaterThanOrEqual(5);
      }
    );


    it(
      'should not create duplicate seed data',
      () => {
        seedService.seedIfNeeded();

        const firstProductCount =
          db.count('products');

        const firstMovementCount =
          db.count('stockMovements');

        seedService.seedIfNeeded();

        expect(
          db.count('products')
        ).toBe(
          firstProductCount
        );

        expect(
          db.count('stockMovements')
        ).toBe(
          firstMovementCount
        );
      }
    );


    it(
      'should keep movement balances non-negative',
      () => {
        seedService.seedIfNeeded();

        const movements =
          db.getAll<StockMovement>(
            'stockMovements'
          );

        expect(
          movements.every(
            movement =>
              movement.newBalance >= 0
          )
        ).toBe(true);
      }
    );


    it(
      'should contain a pending transfer scenario',
      () => {
        seedService.seedIfNeeded();

        const transfers =
          db.getAll<TransferRequest>(
            'transferRequests'
          );

        expect(
          transfers.some(
            transfer =>
              transfer.status === 'PENDING'
          )
        ).toBe(true);
      }
    );


    it(
      'should contain low stock scenarios',
      () => {
        seedService.seedIfNeeded();

        const rules =
          db.getAll<LowStockRule>(
            'lowStockRules'
          );

        const movements =
          db.getAll<StockMovement>(
            'stockMovements'
          );

        const hasLowStock =
          rules.some(rule => {
            const relatedMovements =
              movements.filter(
                movement =>
                  movement.productId === rule.productId
                  &&
                  (
                    !rule.warehouseId
                    ||
                    movement.warehouseId === rule.warehouseId
                  )
              );

            const latestMovement =
              [...relatedMovements]
                .sort(
                  (first, second) =>
                    new Date(
                      second.createdAt
                    ).getTime()
                    -
                    new Date(
                      first.createdAt
                    ).getTime()
                )[0];

            const quantity =
              latestMovement?.newBalance ?? 0;

            return quantity <
              rule.minQuantity;
          });

        expect(
          hasLowStock
        ).toBe(true);
      }
    );
  }
);
