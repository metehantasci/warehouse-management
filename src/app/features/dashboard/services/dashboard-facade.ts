import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  StockStatus
} from '../../../core/models/stock-status.enum';

import {
  TransferStatus
} from '../../../core/models/transfer-status.enum';

import {
  ShipmentStatus
} from '../../../core/models/shipment-status.enum';

import {
  MockDbService
} from '../../../core/services/mock-db';

import {
  Product
} from '../../products/models/product';

import {
  Warehouse
} from '../../warehouses/models/warehouse';

import {
  StockMovement
} from '../../stock-movements/models/stock-movement';

import {
  TransferRequest
} from '../../transfers/models/transfer-request';

import {
  Shipment
} from '../../shipments/models/shipment';

import {
  LowStockRule
} from '../../critical-stock/models/low-stock-rule';

import {
  InventoryQuery
} from '../../stock-movements/models/inventory-query';

import {
  StockBalanceQueryService
} from '../../stock-movements/services/stock-balance-query';

import {
  CriticalStockQueryService
} from '../../critical-stock/services/critical-stock-query';


export interface DashboardSummary {
  activeProductCount: number;

  activeWarehouseCount: number;

  totalStockQuantity: number;

  lowStockCount: number;

  pendingTransferCount: number;

  activeShipmentCount: number;
}


interface DashboardState {
  summary:
    DashboardSummary;

  criticalItems:
    InventoryQuery[];

  recentMovements:
    StockMovement[];

  loading:
    boolean;

  loaded:
    boolean;

  error:
    string | null;
}


const EMPTY_SUMMARY:
  DashboardSummary = {

    activeProductCount:
      0,

    activeWarehouseCount:
      0,

    totalStockQuantity:
      0,

    lowStockCount:
      0,

    pendingTransferCount:
      0,

    activeShipmentCount:
      0
  };


const INITIAL_STATE:
  DashboardState = {

    summary:
      EMPTY_SUMMARY,

    criticalItems:
      [],

    recentMovements:
      [],

    loading:
      false,

    loaded:
      false,

    error:
      null
  };


@Injectable({
  providedIn:
    'root'
})
export class DashboardFacadeService {

  private readonly db =
    inject(
      MockDbService
    );


  private readonly balanceQuery =
    inject(
      StockBalanceQueryService
    );


  private readonly criticalStockQuery =
    inject(
      CriticalStockQueryService
    );


  private readonly state =
    signal<DashboardState>(
      INITIAL_STATE
    );


  readonly summary =
    computed(
      () =>
        this.state().summary
    );


  readonly criticalItems =
    computed(
      () =>
        this.state()
          .criticalItems
    );


  readonly recentMovements =
    computed(
      () =>
        this.state()
          .recentMovements
    );


  readonly loading =
    computed(
      () =>
        this.state().loading
    );


  readonly loaded =
    computed(
      () =>
        this.state().loaded
    );


  readonly error =
    computed(
      () =>
        this.state().error
    );


  readonly hasCriticalStock =
    computed(
      () =>
        this.state()
          .criticalItems
          .length > 0
    );


  load():
    void {

    this.patchState({
      loading:
        true,

      error:
        null
    });


    try {

      const products =
        this.db
          .getAll<Product>(
            'products'
          )
          .filter(
            product =>
              product.isActive
          );


      const warehouses =
        this.db
          .getAll<Warehouse>(
            'warehouses'
          )
          .filter(
            warehouse =>
              warehouse.isActive
          );


      const movements =
        this.db
          .getAll<StockMovement>(
            'stockMovements'
          );


      const transfers =
        this.db
          .getAll<TransferRequest>(
            'transferRequests'
          );


      const shipments =
        this.db
          .getAll<Shipment>(
            'shipments'
          );


      const rules =
        this.db
          .getAll<LowStockRule>(
            'lowStockRules'
          );


      const balances =
        this.balanceQuery
          .calculateBalances(
            movements
          );


      const totalStockQuantity =
        balances.reduce(
          (
            total,
            balance
          ) =>
            total +
            balance.quantity,
          0
        );


      const criticalItems =
        this.criticalStockQuery
          .getCriticalItems(
            products,
            warehouses,
            movements,
            rules
          );


      const lowStockCount =
        criticalItems.filter(
          item =>
            item.status ===
              StockStatus.LOW
            ||
            item.status ===
              StockStatus.CRITICAL
            ||
            item.status ===
              StockStatus.OUT_OF_STOCK
        )
        .length;


      const pendingTransferCount =
        transfers.filter(
          transfer =>
            transfer.status ===
              TransferStatus.PENDING
        )
        .length;


      const activeShipmentCount =
        shipments.filter(
          shipment =>
            shipment.status ===
              ShipmentStatus.PLANNED
            ||
            shipment.status ===
              ShipmentStatus.CONFIRMED
            ||
            shipment.status ===
              ShipmentStatus.SHIPPED
        )
        .length;


      const recentMovements =
        movements
          .slice()
          .sort(
            (
              left,
              right
            ) =>
              new Date(
                right.createdAt
              ).getTime()
              -
              new Date(
                left.createdAt
              ).getTime()
          )
          .slice(
            0,
            8
          );


      this.patchState({
        summary: {
          activeProductCount:
            products.length,

          activeWarehouseCount:
            warehouses.length,

          totalStockQuantity,

          lowStockCount,

          pendingTransferCount,

          activeShipmentCount
        },

        criticalItems:
          criticalItems.slice(
            0,
            8
          ),

        recentMovements,

        loaded:
          true,

        loading:
          false,

        error:
          null
      });

    } catch (error) {

      this.patchState({
        loading:
          false,

        loaded:
          false,

        error:
          this.getErrorMessage(
            error
          )
      });
    }
  }


  reload():
    void {

    this.load();
  }


  private patchState(
    patch:
      Partial<DashboardState>
  ): void {

    this.state.update(
      current => ({
        ...current,
        ...patch
      })
    );
  }


  private getErrorMessage(
    error:
      unknown
  ): string {

    if (
      error instanceof Error
    ) {
      return error.message;
    }


    return (
      'Dashboard verileri hazırlanırken beklenmeyen bir hata oluştu.'
    );
  }
}
