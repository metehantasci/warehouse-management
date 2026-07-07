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
  BaseMovementRequest,
  StockMovementDomainService
} from './stock-movement-domain';


describe(
  'StockMovementDomainService',
  () => {

    let service:
      StockMovementDomainService;


    beforeEach(() => {

      TestBed.configureTestingModule({
        providers: [
          StockMovementDomainService
        ]
      });


      service =
        TestBed.inject(
          StockMovementDomainService
        );
    });


    it(
      'should build stock IN command',
      () => {

        const payload =
          service.buildStockIn(
            baseRequest({
              quantity: 12
            })
          );


        expect(
          payload.type
        ).toBe(
          MovementType.IN
        );


        expect(
          payload.quantity
        ).toBe(12);


        expect(
          payload.productId
        ).toBe(
          'product-1'
        );
      }
    );


    it(
      'should build stock OUT command',
      () => {

        const payload =
          service.buildStockOut(
            baseRequest({
              quantity: 5
            })
          );


        expect(
          payload.type
        ).toBe(
          MovementType.OUT
        );


        expect(
          payload.quantity
        ).toBe(5);
      }
    );


    it(
      'should reject zero or negative quantity',
      () => {

        expect(() => {

          service.buildStockOut(
            baseRequest({
              quantity: 0
            })
          );

        }).toThrow();


        expect(() => {

          service.buildStockIn(
            baseRequest({
              quantity: -3
            })
          );

        }).toThrow();
      }
    );


    it(
      'should build absolute adjustment command',
      () => {

        const payload =
          service.buildAdjustment({
            productId:
              'product-1',

            warehouseId:
              'warehouse-1',

            targetBalance:
              25,

            reason:
              'Sayım düzeltmesi',

            actor: {
              userId:
                'user-1',

              role:
                UserRole.DEPO_SORUMLUSU
            }
          });


        expect(
          payload.type
        ).toBe(
          MovementType.ADJUSTMENT
        );


        expect(
          payload.targetBalance
        ).toBe(25);
      }
    );


    it(
      'should reject negative adjustment target',
      () => {

        expect(() => {

          service.buildAdjustment({
            productId:
              'product-1',

            warehouseId:
              'warehouse-1',

            targetBalance:
              -1,

            reason:
              'Geçersiz test',

            actor: {
              userId:
                'user-1',

              role:
                UserRole.DEPO_SORUMLUSU
            }
          });

        }).toThrow();
      }
    );


    it(
      'should build transfer OUT command with relation id',
      () => {

        const payload =
          service.buildTransferOut({
            ...baseRequest({
              quantity: 4
            }),

            transferId:
              'transfer-1'
          });


        expect(
          payload.type
        ).toBe(
          MovementType.TRANSFER_OUT
        );


        expect(
          payload.relatedTransferId
        ).toBe(
          'transfer-1'
        );
      }
    );
  }
);


function baseRequest(
  overrides:
    Partial<BaseMovementRequest> = {}
): BaseMovementRequest {

  return {
    productId:
      'product-1',

    warehouseId:
      'warehouse-1',

    quantity:
      10,

    reason:
      'Test işlemi',

    actor: {
      userId:
        'user-1',

      role:
        UserRole.DEPO_SORUMLUSU
    },

    ...overrides
  };
}
