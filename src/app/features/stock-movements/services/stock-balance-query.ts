import {
  Injectable
} from '@angular/core';

import {
  MovementType
} from '../../../core/models/movement-type.enum';

import {
  StockBalance
} from '../models/stock-balance';

import {
  StockMovement
} from '../models/stock-movement';


@Injectable({
  providedIn: 'root'
})
export class StockBalanceQueryService {

  calculateBalances(
    movements:
      readonly StockMovement[]
  ): StockBalance[] {

    const balances =
      new Map<string, StockBalance>();


    const activeMovements =
      movements
        .filter(
          movement =>
            !movement.isCancelled
        )
        .slice()
        .sort(
          (left, right) =>
            new Date(
              left.createdAt
            ).getTime()
            -
            new Date(
              right.createdAt
            ).getTime()
        );


    for (
      const movement
      of activeMovements
    ) {

      const key =
        this.createKey(
          movement.productId,
          movement.warehouseId
        );


      const current =
        balances.get(key);


      const currentQuantity =
        current?.quantity ?? 0;


      const nextQuantity =
        this.calculateNextQuantity(
          currentQuantity,
          movement
        );


      balances.set(
        key,
        {
          productId:
            movement.productId,

          warehouseId:
            movement.warehouseId,

          quantity:
            this.normalizeZero(
              nextQuantity
            ),

          lastMovementAt:
            this.getLatestDate(
              current?.lastMovementAt,
              movement.createdAt
            )
        }
      );
    }


    return [
      ...balances.values()
    ];
  }


  calculateBalance(
    movements:
      readonly StockMovement[],

    productId:
      string,

    warehouseId:
      string
  ): number {

    return (
      this
        .calculateBalances(
          movements
        )
        .find(
          balance =>
            balance.productId ===
              productId
            &&
            balance.warehouseId ===
              warehouseId
        )
        ?.quantity
      ?? 0
    );
  }


  calculateProductTotal(
    movements:
      readonly StockMovement[],

    productId:
      string
  ): number {

    return this
      .calculateBalances(
        movements
      )
      .filter(
        balance =>
          balance.productId ===
            productId
      )
      .reduce(
        (
          total,
          balance
        ) =>
          total +
          balance.quantity,
        0
      );
  }


  calculateWarehouseTotal(
    movements:
      readonly StockMovement[],

    warehouseId:
      string
  ): number {

    return this
      .calculateBalances(
        movements
      )
      .filter(
        balance =>
          balance.warehouseId ===
            warehouseId
      )
      .reduce(
        (
          total,
          balance
        ) =>
          total +
          balance.quantity,
        0
      );
  }


  getLastMovementAt(
    movements:
      readonly StockMovement[],

    productId:
      string,

    warehouseId:
      string
  ): string | null {

    const matchingMovements =
      movements
        .filter(
          movement =>
            !movement.isCancelled
            &&
            movement.productId ===
              productId
            &&
            movement.warehouseId ===
              warehouseId
        )
        .slice()
        .sort(
          (left, right) =>
            new Date(
              right.createdAt
            ).getTime()
            -
            new Date(
              left.createdAt
            ).getTime()
        );


    return (
      matchingMovements[0]
        ?.createdAt
      ?? null
    );
  }


  hasSufficientStock(
    movements:
      readonly StockMovement[],

    productId:
      string,

    warehouseId:
      string,

    requestedQuantity:
      number
  ): boolean {

    if (
      !Number.isFinite(
        requestedQuantity
      )
      ||
      requestedQuantity <= 0
    ) {
      return false;
    }


    const currentBalance =
      this.calculateBalance(
        movements,
        productId,
        warehouseId
      );


    return (
      currentBalance >=
      requestedQuantity
    );
  }


  private calculateNextQuantity(
    currentQuantity:
      number,

    movement:
      StockMovement
  ): number {

    switch (
      movement.type
    ) {

      case MovementType.IN:
      case MovementType.TRANSFER_IN:
        return (
          currentQuantity +
          Math.abs(
            movement.quantity
          )
        );


      case MovementType.OUT:
      case MovementType.TRANSFER_OUT:
        return (
          currentQuantity -
          Math.abs(
            movement.quantity
          )
        );


      case MovementType.ADJUSTMENT:
        return movement.newBalance;


      default: {
        const exhaustiveCheck:
          never = movement.type;

        throw new Error(
          `Desteklenmeyen stok hareket tipi: ${String(exhaustiveCheck)}`
        );
      }
    }
  }


  private createKey(
    productId:
      string,

    warehouseId:
      string
  ): string {

    return (
      `${productId}::${warehouseId}`
    );
  }


  private getLatestDate(
    currentDate:
      string | null | undefined,

    candidateDate:
      string
  ): string {

    if (!currentDate) {
      return candidateDate;
    }


    return (
      new Date(
        candidateDate
      ).getTime()
      >
      new Date(
        currentDate
      ).getTime()
    )
      ? candidateDate
      : currentDate;
  }


  private normalizeZero(
    value:
      number
  ): number {

    return Object.is(
      value,
      -0
    )
      ? 0
      : value;
  }
}
