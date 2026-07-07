import {
  Injectable,
  inject
} from '@angular/core';

import {
  StockStatus
} from '../../../core/models/stock-status.enum';

import {
  Product
} from '../../products/models/product';

import {
  InventoryQuery
} from '../../stock-movements/models/inventory-query';

import {
  StockMovement
} from '../../stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../stock-movements/services/stock-balance-query';

import {
  Warehouse
} from '../../warehouses/models/warehouse';

import {
  LowStockRule
} from '../models/low-stock-rule';


@Injectable({
  providedIn: 'root'
})
export class CriticalStockQueryService {

  private readonly balanceQuery =
    inject(
      StockBalanceQueryService
    );


  buildInventory(
    products:
      readonly Product[],

    warehouses:
      readonly Warehouse[],

    movements:
      readonly StockMovement[],

    rules:
      readonly LowStockRule[]
  ): InventoryQuery[] {

    const balances =
      this.balanceQuery
        .calculateBalances(
          movements
        );


    const result:
      InventoryQuery[] = [];


    for (
      const product
      of products
    ) {

      for (
        const warehouse
        of warehouses
      ) {

        const balance =
          balances.find(
            item =>
              item.productId ===
                product.id
              &&
              item.warehouseId ===
                warehouse.id
          );


        const quantity =
          balance?.quantity ?? 0;


        const minQuantity =
          this.resolveMinQuantity(
            product,
            warehouse.id,
            rules
          );


        result.push({
          productId:
            product.id,

          productName:
            product.name,

          productCode:
            product.code,

          warehouseId:
            warehouse.id,

          warehouseName:
            warehouse.name,

          quantity,

          minQuantity,

          status:
            this.resolveStatus(
              quantity,
              minQuantity
            )
        });
      }
    }


    return result;
  }


  getCriticalItems(
    products:
      readonly Product[],

    warehouses:
      readonly Warehouse[],

    movements:
      readonly StockMovement[],

    rules:
      readonly LowStockRule[]
  ): InventoryQuery[] {

    return this
      .buildInventory(
        products,
        warehouses,
        movements,
        rules
      )
      .filter(
        item =>
          item.status !==
            StockStatus.NORMAL
      )
      .sort(
        (
          left,
          right
        ) =>
          this.statusPriority(
            left.status
          )
          -
          this.statusPriority(
            right.status
          )
          ||
          left.quantity -
          right.quantity
      );
  }


  private resolveMinQuantity(
    product:
      Product,

    warehouseId:
      string,

    rules:
      readonly LowStockRule[]
  ): number {

    const warehouseRule =
      rules.find(
        rule =>
          rule.isActive
          &&
          rule.productId ===
            product.id
          &&
          rule.warehouseId ===
            warehouseId
      );


    if (warehouseRule) {
      return warehouseRule.minQuantity;
    }


    const globalRule =
      rules.find(
        rule =>
          rule.isActive
          &&
          rule.productId ===
            product.id
          &&
          !rule.warehouseId
      );


    return (
      globalRule?.minQuantity
      ??
      product.defaultMinQuantity
      ??
      0
    );
  }


  private resolveStatus(
    quantity:
      number,

    minQuantity:
      number
  ): StockStatus {

    if (quantity <= 0) {
      return StockStatus.OUT_OF_STOCK;
    }


    if (minQuantity <= 0) {
      return StockStatus.NORMAL;
    }


    if (
      quantity <=
      minQuantity * 0.5
    ) {
      return StockStatus.CRITICAL;
    }


    if (
      quantity <
      minQuantity
    ) {
      return StockStatus.LOW;
    }


    return StockStatus.NORMAL;
  }


  private statusPriority(
    status:
      StockStatus
  ): number {

    switch (status) {

      case StockStatus.OUT_OF_STOCK:
        return 0;

      case StockStatus.CRITICAL:
        return 1;

      case StockStatus.LOW:
        return 2;

      case StockStatus.NORMAL:
        return 3;

      default: {
        const exhaustive:
          never = status;

        return exhaustive;
      }
    }
  }
}
