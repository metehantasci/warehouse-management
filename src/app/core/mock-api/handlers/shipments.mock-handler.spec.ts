import {
  HttpErrorResponse,
  HttpRequest
} from '@angular/common/http';

import {
  TestBed
} from '@angular/core/testing';

import {
  MovementType
} from '../../models/movement-type.enum';

import {
  ShipmentStatus
} from '../../models/shipment-status.enum';

import {
  UnitOfMeasure
} from '../../models/unit-of-measure.enum';

import {
  UserRole
} from '../../models/user-role.enum';

import {
  Product
} from '../../../features/products/models/product';

import {
  Shipment
} from '../../../features/shipments/models/shipment';

import {
  CreateShipmentPayload
} from '../../../features/shipments/services/shipment-data';

import {
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../../features/stock-movements/services/stock-balance-query';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  AuthService
} from '../../services/auth';

import {
  IdGeneratorService
} from '../../services/id-generator';

import {
  MockApiConfigService
} from '../../services/mock-api-config';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';

import {
  StorageService
} from '../../services/storage';

import {
  ShipmentsMockHandler
} from './shipments.mock-handler';


describe(
  'ShipmentsMockHandler',
  () => {

    let handler:
      ShipmentsMockHandler;

    let db:
      MockDbService;

    let balanceQuery:
      StockBalanceQueryService;


    beforeEach(() => {

      localStorage.clear();


      TestBed.configureTestingModule({
        providers: [
          StorageService,
          MockDbService,
          IdGeneratorService,
          AuthService,
          AuditLogService,
          MockApiConfigService,
          MockApiRuntimeService,
          StockBalanceQueryService
        ]
      });


      db =
        TestBed.inject(
          MockDbService
        );


      balanceQuery =
        TestBed.inject(
          StockBalanceQueryService
        );


      const authService =
        TestBed.inject(
          AuthService
        );


      authService.login(
        'depo@wms.local',
        '123456'
      );


      handler =
        new ShipmentsMockHandler(
          db,

          TestBed.inject(
            MockApiRuntimeService
          ),

          TestBed.inject(
            AuditLogService
          ),

          TestBed.inject(
            IdGeneratorService
          ),

          balanceQuery,

          authService
        );


      seedBaseData();
    });


    it(
      'should create PLANNED shipment without changing stock',
      () => {

        const beforeBalance =
          getBalance();


        const response =
          createShipment({
            items: [
              {
                productId:
                  'product-1',

                quantity:
                  4
              }
            ]
          });


        const shipment =
          unwrapShipment(
            response.body
          );


        expect(
          shipment.status
        ).toBe(
          ShipmentStatus.PLANNED
        );


        expect(
          getBalance()
        ).toBe(
          beforeBalance
        );


        const relatedMovements =
          db
            .getAll<StockMovement>(
              'stockMovements'
            )
            .filter(
              movement =>
                movement.relatedShipmentId ===
                  shipment.id
            );


        expect(
          relatedMovements.length
        ).toBe(0);
      }
    );


    it(
      'should confirm shipment without changing stock',
      () => {

        const created =
          unwrapShipment(
            createShipment().body
          );


        const beforeBalance =
          getBalance();


        const request =
          new HttpRequest(
            'PATCH',
            `/api/shipments/${created.id}/confirm`,
            {}
          );


        const response =
          handler.handle(
            request,
            created.id,
            'confirm'
          );


        const confirmed =
          unwrapShipment(
            response.body
          );


        expect(
          confirmed.status
        ).toBe(
          ShipmentStatus.CONFIRMED
        );


        expect(
          getBalance()
        ).toBe(
          beforeBalance
        );
      }
    );


    it(
      'should ship CONFIRMED shipment and deduct stock',
      () => {

        const created =
          unwrapShipment(
            createShipment({
              items: [
                {
                  productId:
                    'product-1',

                  quantity:
                    4
                }
              ]
            }).body
          );


        const confirmRequest =
          new HttpRequest(
            'PATCH',
            `/api/shipments/${created.id}/confirm`,
            {}
          );


        handler.handle(
          confirmRequest,
          created.id,
          'confirm'
        );


        const shipRequest =
          new HttpRequest(
            'PATCH',
            `/api/shipments/${created.id}/ship`,
            {}
          );


        const response =
          handler.handle(
            shipRequest,
            created.id,
            'ship'
          );


        const shipped =
          unwrapShipment(
            response.body
          );


        expect(
          shipped.status
        ).toBe(
          ShipmentStatus.SHIPPED
        );


        expect(
          getBalance()
        ).toBe(6);


        const relatedMovements =
          db
            .getAll<StockMovement>(
              'stockMovements'
            )
            .filter(
              movement =>
                movement.relatedShipmentId ===
                  created.id
            );


        expect(
          relatedMovements.length
        ).toBe(1);


        expect(
          relatedMovements[0].type
        ).toBe(
          MovementType.OUT
        );


        expect(
          relatedMovements[0].quantity
        ).toBe(4);
      }
    );


    it(
      'should deliver SHIPPED shipment',
      () => {

        const created =
          unwrapShipment(
            createShipment().body
          );


        handler.handle(
          new HttpRequest(
            'PATCH',
            `/api/shipments/${created.id}/confirm`,
            {}
          ),
          created.id,
          'confirm'
        );


        handler.handle(
          new HttpRequest(
            'PATCH',
            `/api/shipments/${created.id}/ship`,
            {}
          ),
          created.id,
          'ship'
        );


        const response =
          handler.handle(
            new HttpRequest(
              'PATCH',
              `/api/shipments/${created.id}/deliver`,
              {}
            ),
            created.id,
            'deliver'
          );


        const delivered =
          unwrapShipment(
            response.body
          );


        expect(
          delivered.status
        ).toBe(
          ShipmentStatus.DELIVERED
        );


        expect(
          delivered.deliveredAt
        ).toBeTruthy();
      }
    );


    it(
      'should reject planning when stock is insufficient',
      () => {

        expect(() => {

          createShipment({
            items: [
              {
                productId:
                  'product-1',

                quantity:
                  11
              }
            ]
          });

        }).toThrow(
          HttpErrorResponse
        );


        expect(
          db.count(
            'shipments'
          )
        ).toBe(0);


        expect(
          getBalance()
        ).toBe(10);
      }
    );


    it(
      'should cancel PLANNED shipment without changing stock',
      () => {

        const created =
          unwrapShipment(
            createShipment().body
          );


        const beforeBalance =
          getBalance();


        const response =
          handler.handle(
            new HttpRequest(
              'PATCH',
              `/api/shipments/${created.id}/cancel`,
              {
                reason:
                  'Müşteri talebi iptal etti'
              }
            ),
            created.id,
            'cancel'
          );


        const cancelled =
          unwrapShipment(
            response.body
          );


        expect(
          cancelled.status
        ).toBe(
          ShipmentStatus.CANCELLED
        );


        expect(
          getBalance()
        ).toBe(
          beforeBalance
        );
      }
    );


    it(
      'should reject shipping a PLANNED shipment directly',
      () => {

        const created =
          unwrapShipment(
            createShipment().body
          );


        expect(() => {

          handler.handle(
            new HttpRequest(
              'PATCH',
              `/api/shipments/${created.id}/ship`,
              {}
            ),
            created.id,
            'ship'
          );

        }).toThrow(
          HttpErrorResponse
        );


        expect(
          getBalance()
        ).toBe(10);
      }
    );


    it(
      'should merge duplicate product items before validation',
      () => {

        const shipment =
          unwrapShipment(
            createShipment({
              items: [
                {
                  productId:
                    'product-1',

                  quantity:
                    3
                },

                {
                  productId:
                    'product-1',

                  quantity:
                    2
                }
              ]
            }).body
          );


        expect(
          shipment.items.length
        ).toBe(1);


        expect(
          shipment.items[0].quantity
        ).toBe(5);
      }
    );


    function createShipment(
      overrides:
        Partial<
          CreateShipmentPayload
        > = {}
    ) {

      const payload:
        CreateShipmentPayload = {

        sourceWarehouseId:
          'warehouse-1',

        destinationName:
          'Test Müşteri',

        destinationAddress:
          'Çankaya / Ankara',

        plannedDate:
          '2026-07-10T09:00:00.000Z',

        items: [
          {
            productId:
              'product-1',

            quantity:
              3
          }
        ],

        note:
          'Test sevkiyatı',

        ...overrides
      };


      return handler.handle(
        new HttpRequest(
          'POST',
          '/api/shipments',
          payload
        ),
        null,
        null
      );
    }


    function getBalance():
      number {

      return balanceQuery
        .calculateBalance(
          db.getAll<StockMovement>(
            'stockMovements'
          ),
          'product-1',
          'warehouse-1'
        );
    }


    function unwrapShipment(
      body:
        unknown
    ): Shipment {

      return (
        body as {
          data:
            Shipment;
        }
      ).data;
    }


    function seedBaseData():
      void {

      const product:
        Product = {

        id:
          'product-1',

        code:
          'TEST-001',

        name:
          'Test Ürün',

        category:
          'Test',

        unit:
          UnitOfMeasure.ADET,

        barcode:
          '8699999999915',

        unitPrice:
          100,

        defaultMinQuantity:
          2,

        isActive:
          true,

        createdAt:
          '2026-01-01T00:00:00.000Z',

        updatedAt:
          '2026-01-01T00:00:00.000Z'
      };


      const warehouse:
        Warehouse = {

        id:
          'warehouse-1',

        code:
          'WH-001',

        name:
          'Test Depo',

        address:
          'Ankara',

        city:
          'Ankara',

        isActive:
          true,

        createdAt:
          '2026-01-01T00:00:00.000Z',

        updatedAt:
          '2026-01-01T00:00:00.000Z'
      };


      const movement:
        StockMovement = {

        id:
          'movement-1',

        productId:
          'product-1',

        warehouseId:
          'warehouse-1',

        type:
          MovementType.IN,

        quantity:
          10,

        previousBalance:
          0,

        newBalance:
          10,

        performedByUserId:
          'user-depo-001',

        performedByRole:
          UserRole.DEPO_SORUMLUSU,

        reason:
          'Başlangıç stoğu',

        createdAt:
          '2026-01-01T10:00:00.000Z',

        updatedAt:
          '2026-01-01T10:00:00.000Z',

        isCancelled:
          false
      };


      db.setAll(
        'products',
        [product]
      );


      db.setAll(
        'warehouses',
        [warehouse]
      );


      db.setAll(
        'stockMovements',
        [movement]
      );


      db.setAll(
        'shipments',
        []
      );


      db.setAll(
        'auditLog',
        []
      );
    }
  }
);
