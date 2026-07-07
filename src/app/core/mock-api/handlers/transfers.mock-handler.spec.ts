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
  TransferStatus
} from '../../models/transfer-status.enum';

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
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../../features/stock-movements/services/stock-balance-query';

import {
  CreateTransferRequestPayload
} from '../../../features/transfers/services/transfer-data';

import {
  TransferRequest
} from '../../../features/transfers/models/transfer-request';

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
  TransfersMockHandler
} from './transfers.mock-handler';


describe(
  'TransfersMockHandler',
  () => {

    let handler:
      TransfersMockHandler;

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
        new TransfersMockHandler(
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
      'should create PENDING transfer and deduct source stock',
      () => {

        const response =
          createTransfer({
            quantity:
              4
          });


        const transfer =
          unwrapTransfer(
            response.body
          );


        expect(
          transfer.status
        ).toBe(
          TransferStatus.PENDING
        );


        expect(
          getBalance(
            'product-1',
            'warehouse-source'
          )
        ).toBe(6);


        expect(
          getBalance(
            'product-1',
            'warehouse-destination'
          )
        ).toBe(2);


        const relatedMovements =
          db
            .getAll<StockMovement>(
              'stockMovements'
            )
            .filter(
              movement =>
                movement.relatedTransferId ===
                  transfer.id
            );


        expect(
          relatedMovements.length
        ).toBe(1);


        expect(
          relatedMovements[0].type
        ).toBe(
          MovementType.TRANSFER_OUT
        );
      }
    );


    it(
      'should approve PENDING transfer and add stock to destination',
      () => {

        const createResponse =
          createTransfer({
            quantity:
              4
          });


        const created =
          unwrapTransfer(
            createResponse.body
          );


        const approveRequest =
          new HttpRequest(
            'PATCH',
            `/api/transfers/${created.id}/approve`,
            {}
          );


        const approveResponse =
          handler.handle(
            approveRequest,
            created.id,
            'approve'
          );


        const approved =
          unwrapTransfer(
            approveResponse.body
          );


        expect(
          approved.status
        ).toBe(
          TransferStatus.APPROVED
        );


        expect(
          getBalance(
            'product-1',
            'warehouse-source'
          )
        ).toBe(6);


        expect(
          getBalance(
            'product-1',
            'warehouse-destination'
          )
        ).toBe(6);


        const relatedMovements =
          db
            .getAll<StockMovement>(
              'stockMovements'
            )
            .filter(
              movement =>
                movement.relatedTransferId ===
                  created.id
            );


        expect(
          relatedMovements.length
        ).toBe(2);


        expect(
          relatedMovements.some(
            movement =>
              movement.type ===
                MovementType.TRANSFER_IN
          )
        ).toBe(true);
      }
    );


    it(
      'should cancel PENDING transfer and restore source stock',
      () => {

        const createResponse =
          createTransfer({
            quantity:
              4
          });


        const created =
          unwrapTransfer(
            createResponse.body
          );


        expect(
          getBalance(
            'product-1',
            'warehouse-source'
          )
        ).toBe(6);


        const cancelRequest =
          new HttpRequest(
            'PATCH',
            `/api/transfers/${created.id}/cancel`,
            {
              reason:
                'İhtiyaç kalmadı'
            }
          );


        const cancelResponse =
          handler.handle(
            cancelRequest,
            created.id,
            'cancel'
          );


        const cancelled =
          unwrapTransfer(
            cancelResponse.body
          );


        expect(
          cancelled.status
        ).toBe(
          TransferStatus.CANCELLED
        );


        expect(
          getBalance(
            'product-1',
            'warehouse-source'
          )
        ).toBe(10);


        expect(
          getBalance(
            'product-1',
            'warehouse-destination'
          )
        ).toBe(2);
      }
    );


    it(
      'should reject transfer when source stock is insufficient',
      () => {

        expect(() => {

          createTransfer({
            quantity:
              11
          });

        }).toThrow(
          HttpErrorResponse
        );


        expect(
          db.count(
            'transferRequests'
          )
        ).toBe(0);


        expect(
          getBalance(
            'product-1',
            'warehouse-source'
          )
        ).toBe(10);
      }
    );


    it(
      'should reject same source and destination warehouse',
      () => {

        expect(() => {

          createTransfer({
            destinationWarehouseId:
              'warehouse-source'
          });

        }).toThrow(
          HttpErrorResponse
        );


        expect(
          db.count(
            'transferRequests'
          )
        ).toBe(0);
      }
    );


    it(
      'should reject approving the same transfer twice',
      () => {

        const createResponse =
          createTransfer({
            quantity:
              3
          });


        const created =
          unwrapTransfer(
            createResponse.body
          );


        const request =
          new HttpRequest(
            'PATCH',
            `/api/transfers/${created.id}/approve`,
            {}
          );


        handler.handle(
          request,
          created.id,
          'approve'
        );


        expect(() => {

          handler.handle(
            request,
            created.id,
            'approve'
          );

        }).toThrow(
          HttpErrorResponse
        );
      }
    );


    function createTransfer(
      overrides:
        Partial<
          CreateTransferRequestPayload
        > = {}
    ) {

      const payload:
        CreateTransferRequestPayload = {

        productId:
          'product-1',

        sourceWarehouseId:
          'warehouse-source',

        destinationWarehouseId:
          'warehouse-destination',

        quantity:
          4,

        note:
          'Test transferi',

        ...overrides
      };


      const request =
        new HttpRequest(
          'POST',
          '/api/transfers',
          payload
        );


      return handler.handle(
        request,
        null,
        null
      );
    }


    function getBalance(
      productId:
        string,

      warehouseId:
        string
    ): number {

      return balanceQuery
        .calculateBalance(
          db.getAll<StockMovement>(
            'stockMovements'
          ),
          productId,
          warehouseId
        );
    }


    function seedBaseData():
      void {

      const products:
        Product[] = [
          {
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
              '8699999999991',

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
          }
        ];


      const warehouses:
        Warehouse[] = [

          {
            id:
              'warehouse-source',

            code:
              'SRC-001',

            name:
              'Kaynak Depo',

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
          },


          {
            id:
              'warehouse-destination',

            code:
              'DST-001',

            name:
              'Hedef Depo',

            address:
              'İstanbul',

            city:
              'İstanbul',

            isActive:
              true,

            createdAt:
              '2026-01-01T00:00:00.000Z',

            updatedAt:
              '2026-01-01T00:00:00.000Z'
          }
        ];


      const movements:
        StockMovement[] = [

          {
            id:
              'movement-source-in',

            productId:
              'product-1',

            warehouseId:
              'warehouse-source',

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
              'Kaynak başlangıç stoğu',

            createdAt:
              '2026-01-01T10:00:00.000Z',

            updatedAt:
              '2026-01-01T10:00:00.000Z',

            isCancelled:
              false
          },


          {
            id:
              'movement-destination-in',

            productId:
              'product-1',

            warehouseId:
              'warehouse-destination',

            type:
              MovementType.IN,

            quantity:
              2,

            previousBalance:
              0,

            newBalance:
              2,

            performedByUserId:
              'user-depo-001',

            performedByRole:
              UserRole.DEPO_SORUMLUSU,

            reason:
              'Hedef başlangıç stoğu',

            createdAt:
              '2026-01-01T11:00:00.000Z',

            updatedAt:
              '2026-01-01T11:00:00.000Z',

            isCancelled:
              false
          }
        ];


      db.setAll(
        'products',
        products
      );


      db.setAll(
        'warehouses',
        warehouses
      );


      db.setAll(
        'stockMovements',
        movements
      );


      db.setAll(
        'transferRequests',
        []
      );


      db.setAll(
        'auditLog',
        []
      );
    }


    function unwrapTransfer(
      body:
        unknown
    ): TransferRequest {

      return (
        body as {
          data:
            TransferRequest;
        }
      ).data;
    }
  }
);
