import {
  Injectable
} from '@angular/core';

import {
  MovementType
} from '../../../core/models/movement-type.enum';

import {
  StockMovement
} from '../models/stock-movement';


export interface MovementActor {
  userId: string;

  role:
    StockMovement[
      'performedByRole'
    ];
}


export interface BaseMovementRequest {
  productId: string;

  warehouseId: string;

  quantity: number;

  reason: string;

  actor: MovementActor;
}


export interface TransferMovementRequest
  extends BaseMovementRequest {

  transferId: string;
}


export interface ShipmentMovementRequest
  extends BaseMovementRequest {

  shipmentId: string;
}


export interface AdjustmentMovementRequest {
  productId: string;

  warehouseId: string;

  targetBalance: number;

  reason: string;

  actor: MovementActor;
}


export interface CreateStockMovementPayload {
  productId: string;

  warehouseId: string;

  type: MovementType;

  quantity: number;

  reason: string;

  performedByUserId: string;

  performedByRole:
    StockMovement[
      'performedByRole'
    ];

  relatedTransferId?: string;

  relatedShipmentId?: string;

  targetBalance?: number;
}


@Injectable({
  providedIn: 'root'
})
export class StockMovementDomainService {

  buildStockIn(
    request:
      BaseMovementRequest
  ): CreateStockMovementPayload {

    this.assertBaseRequest(
      request
    );


    return this.buildBasePayload(
      request,
      MovementType.IN
    );
  }


  buildStockOut(
    request:
      BaseMovementRequest
  ): CreateStockMovementPayload {

    this.assertBaseRequest(
      request
    );


    return this.buildBasePayload(
      request,
      MovementType.OUT
    );
  }


  buildAdjustment(
    request:
      AdjustmentMovementRequest
  ): CreateStockMovementPayload {

    this.assertIds(
      request.productId,
      request.warehouseId
    );

    this.assertNonNegativeTargetBalance(
      request.targetBalance
    );

    this.assertRequiredReason(
      request.reason
    );

    this.assertActor(
      request.actor
    );


    return {
      productId:
        request.productId,

      warehouseId:
        request.warehouseId,

      type:
        MovementType.ADJUSTMENT,

      quantity:
        0,

      targetBalance:
        request.targetBalance,

      reason:
        request.reason.trim(),

      performedByUserId:
        request.actor.userId,

      performedByRole:
        request.actor.role
    };
  }


  buildTransferOut(
    request:
      TransferMovementRequest
  ): CreateStockMovementPayload {

    this.assertBaseRequest(
      request
    );

    this.assertTransferId(
      request.transferId
    );


    return {
      ...this.buildBasePayload(
        request,
        MovementType.TRANSFER_OUT
      ),

      relatedTransferId:
        request.transferId
    };
  }


  buildTransferIn(
    request:
      TransferMovementRequest
  ): CreateStockMovementPayload {

    this.assertBaseRequest(
      request
    );

    this.assertTransferId(
      request.transferId
    );


    return {
      ...this.buildBasePayload(
        request,
        MovementType.TRANSFER_IN
      ),

      relatedTransferId:
        request.transferId
    };
  }


  buildShipmentOut(
    request:
      ShipmentMovementRequest
  ): CreateStockMovementPayload {

    this.assertBaseRequest(
      request
    );

    this.assertShipmentId(
      request.shipmentId
    );


    return {
      ...this.buildBasePayload(
        request,
        MovementType.OUT
      ),

      relatedShipmentId:
        request.shipmentId
    };
  }


  private buildBasePayload(
    request:
      BaseMovementRequest,

    type:
      MovementType
  ): CreateStockMovementPayload {

    return {
      productId:
        request.productId,

      warehouseId:
        request.warehouseId,

      type,

      quantity:
        Math.abs(
          request.quantity
        ),

      reason:
        request.reason.trim(),

      performedByUserId:
        request.actor.userId,

      performedByRole:
        request.actor.role
    };
  }


  private assertBaseRequest(
    request:
      BaseMovementRequest
  ): void {

    this.assertIds(
      request.productId,
      request.warehouseId
    );

    this.assertPositiveQuantity(
      request.quantity
    );

    this.assertRequiredReason(
      request.reason
    );

    this.assertActor(
      request.actor
    );
  }


  private assertIds(
    productId:
      string,

    warehouseId:
      string
  ): void {

    if (!productId?.trim()) {
      throw new Error(
        'Ürün seçimi zorunludur.'
      );
    }


    if (!warehouseId?.trim()) {
      throw new Error(
        'Depo seçimi zorunludur.'
      );
    }
  }


  private assertPositiveQuantity(
    quantity:
      number
  ): void {

    if (
      !Number.isFinite(
        quantity
      )
      ||
      quantity <= 0
    ) {
      throw new Error(
        'Miktar 0 değerinden büyük olmalıdır.'
      );
    }
  }


  private assertNonNegativeTargetBalance(
    targetBalance:
      number
  ): void {

    if (
      !Number.isFinite(
        targetBalance
      )
      ||
      targetBalance < 0
    ) {
      throw new Error(
        'Hedef bakiye negatif olamaz.'
      );
    }
  }


  private assertRequiredReason(
    reason:
      string
  ): void {

    if (!reason?.trim()) {
      throw new Error(
        'Stok hareketi nedeni zorunludur.'
      );
    }
  }


  private assertActor(
    actor:
      MovementActor
  ): void {

    if (!actor?.userId?.trim()) {
      throw new Error(
        'İşlem yapan kullanıcı zorunludur.'
      );
    }


    if (!actor.role) {
      throw new Error(
        'İşlem yapan kullanıcı rolü zorunludur.'
      );
    }
  }


  private assertTransferId(
    transferId:
      string
  ): void {

    if (!transferId?.trim()) {
      throw new Error(
        'Transfer hareketi için transferId zorunludur.'
      );
    }
  }


  private assertShipmentId(
    shipmentId:
      string
  ): void {

    if (!shipmentId?.trim()) {
      throw new Error(
        'Sevkiyat hareketi için shipmentId zorunludur.'
      );
    }
  }
}
