import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  Product
} from '../../../features/products/models/product';

import {
  LowStockRule
} from '../../../features/critical-stock/models/low-stock-rule';

import {
  CriticalStockQueryService
} from '../../../features/critical-stock/services/critical-stock-query';

import {
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';


export class CriticalStockMockHandler {

  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly criticalQuery:
      CriticalStockQueryService
  ) {}


  handle(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    if (
      request.method !==
      'GET'
    ) {
      throw new HttpErrorResponse({
        status: 405,

        statusText:
          'Method Not Allowed',

        error:
          this.runtime.error(
            'Bu kritik stok işlemi desteklenmiyor.',
            'METHOD_NOT_ALLOWED'
          )
      });
    }


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
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const rules =
      this.db.getAll<LowStockRule>(
        'lowStockRules'
      );


    let items =
      this.criticalQuery
        .getCriticalItems(
          products,
          warehouses,
          movements,
          rules
        );


    const productId =
      request.params.get(
        'productId'
      );


    if (productId) {
      items =
        items.filter(
          item =>
            item.productId ===
              productId
        );
    }


    const warehouseId =
      request.params.get(
        'warehouseId'
      );


    if (warehouseId) {
      items =
        items.filter(
          item =>
            item.warehouseId ===
              warehouseId
        );
    }


    const status =
      request.params.get(
        'status'
      );


    if (status) {
      items =
        items.filter(
          item =>
            item.status ===
              status
        );
    }


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          items
        )
    });
  }
}
