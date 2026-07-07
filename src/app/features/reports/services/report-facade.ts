import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  MovementType
} from '../../../core/models/movement-type.enum';

import {
  ShipmentStatus
} from '../../../core/models/shipment-status.enum';

import {
  TransferStatus
} from '../../../core/models/transfer-status.enum';

import {
  MockDbService
} from '../../../core/services/mock-db';

import {
  Product
} from '../../products/models/product';

import {
  Shipment
} from '../../shipments/models/shipment';

import {
  StockMovement
} from '../../stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../stock-movements/services/stock-balance-query';

import {
  TransferRequest
} from '../../transfers/models/transfer-request';

import {
  Warehouse
} from '../../warehouses/models/warehouse';


export interface WarehouseStockReportItem {
  warehouseId: string;

  warehouseCode: string;

  warehouseName: string;

  totalQuantity: number;
}


export interface ProductStockReportItem {
  productId: string;

  productCode: string;

  productName: string;

  totalQuantity: number;
}


export interface MovementTypeReportItem {
  type: MovementType;

  count: number;

  totalQuantity: number;
}


export interface TransferStatusReportItem {
  status: TransferStatus;

  count: number;
}


export interface ShipmentStatusReportItem {
  status: ShipmentStatus;

  count: number;
}


interface ReportState {

  totalStockQuantity:
    number;

  warehouseStock:
    WarehouseStockReportItem[];

  productStock:
    ProductStockReportItem[];

  movementTypes:
    MovementTypeReportItem[];

  transferStatuses:
    TransferStatusReportItem[];

  shipmentStatuses:
    ShipmentStatusReportItem[];

  loading:
    boolean;

  loaded:
    boolean;

  error:
    string | null;
}


const INITIAL_STATE:
  ReportState = {

    totalStockQuantity:
      0,

    warehouseStock:
      [],

    productStock:
      [],

    movementTypes:
      [],

    transferStatuses:
      [],

    shipmentStatuses:
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
export class ReportFacadeService {

  private readonly db =
    inject(
      MockDbService
    );


  private readonly balanceQuery =
    inject(
      StockBalanceQueryService
    );


  private readonly state =
    signal<ReportState>(
      INITIAL_STATE
    );


  readonly totalStockQuantity =
    computed(
      () =>
        this.state()
          .totalStockQuantity
    );


  readonly warehouseStock =
    computed(
      () =>
        this.state()
          .warehouseStock
    );


  readonly productStock =
    computed(
      () =>
        this.state()
          .productStock
    );


  readonly movementTypes =
    computed(
      () =>
        this.state()
          .movementTypes
    );


  readonly transferStatuses =
    computed(
      () =>
        this.state()
          .transferStatuses
    );


  readonly shipmentStatuses =
    computed(
      () =>
        this.state()
          .shipmentStatuses
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
          );


      const warehouses =
        this.db
          .getAll<Warehouse>(
            'warehouses'
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


      const warehouseStock =
        warehouses
          .map(
            warehouse => ({

              warehouseId:
                warehouse.id,

              warehouseCode:
                warehouse.code,

              warehouseName:
                warehouse.name,

              totalQuantity:
                balances
                  .filter(
                    balance =>
                      balance.warehouseId ===
                        warehouse.id
                  )
                  .reduce(
                    (
                      total,
                      balance
                    ) =>
                      total +
                      balance.quantity,
                    0
                  )
            })
          )
          .sort(
            (
              left,
              right
            ) =>
              right.totalQuantity -
              left.totalQuantity
          );


      const productStock =
        products
          .map(
            product => ({

              productId:
                product.id,

              productCode:
                product.code,

              productName:
                product.name,

              totalQuantity:
                balances
                  .filter(
                    balance =>
                      balance.productId ===
                        product.id
                  )
                  .reduce(
                    (
                      total,
                      balance
                    ) =>
                      total +
                      balance.quantity,
                    0
                  )
            })
          )
          .sort(
            (
              left,
              right
            ) =>
              right.totalQuantity -
              left.totalQuantity
          );


      const movementTypes =
        Object
          .values(
            MovementType
          )
          .map(
            type => {

              const matching =
                movements.filter(
                  movement =>
                    !movement.isCancelled
                    &&
                    movement.type ===
                      type
                );


              return {
                type,

                count:
                  matching.length,

                totalQuantity:
                  matching.reduce(
                    (
                      total,
                      movement
                    ) =>
                      total +
                      Math.abs(
                        movement.quantity
                      ),
                    0
                  )
              };
            }
          );


      const transferStatuses =
        Object
          .values(
            TransferStatus
          )
          .map(
            status => ({
              status,

              count:
                transfers.filter(
                  transfer =>
                    transfer.status ===
                      status
                )
                .length
            })
          );


      const shipmentStatuses =
        Object
          .values(
            ShipmentStatus
          )
          .map(
            status => ({
              status,

              count:
                shipments.filter(
                  shipment =>
                    shipment.status ===
                      status
                )
                .length
            })
          );


      this.patchState({
        totalStockQuantity,

        warehouseStock,

        productStock,

        movementTypes,

        transferStatuses,

        shipmentStatuses,

        loading:
          false,

        loaded:
          true,

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
      Partial<ReportState>
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
      'Rapor verileri hazırlanırken beklenmeyen bir hata oluştu.'
    );
  }
}
