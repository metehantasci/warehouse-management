import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  finalize,
  forkJoin,
  Observable
} from 'rxjs';

import {
  Product
} from '../../products/models/product';

import {
  ProductDataService
} from '../../products/services/product-data';

import {
  Warehouse
} from '../../warehouses/models/warehouse';

import {
  WarehouseDataService
} from '../../warehouses/services/warehouse-data';

import {
  TransferRequest
} from '../models/transfer-request';

import {
  CreateTransferRequestPayload
} from './transfer-data';

import {
  TransferFacadeService
} from './transfer-facade';

@Injectable({
  providedIn: 'root'
})
export class TransferFormFacadeService {
  private readonly productData =
    inject(ProductDataService);

  private readonly warehouseData =
    inject(WarehouseDataService);

  private readonly transferFacade =
    inject(TransferFacadeService);

  private readonly productsState =
    signal<Product[]>([]);

  private readonly warehousesState =
    signal<Warehouse[]>([]);

  private readonly loadingState =
    signal(false);

  private readonly errorState =
    signal<string | null>(null);

  readonly products =
    computed(
      () =>
        this.productsState()
          .filter(
            item => item.isActive
          )
    );

  readonly warehouses =
    computed(
      () =>
        this.warehousesState()
          .filter(
            item => item.isActive
          )
    );

  readonly loading =
    this.loadingState.asReadonly();

  readonly error =
    this.errorState.asReadonly();

  loadOptions(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      products:
        this.productData.getAll({
          page: 1,
          pageSize: 300,
          sortBy: 'name',
          sortDirection: 'asc'
        }),

      warehouses:
        this.warehouseData.getAll({
          page: 1,
          pageSize: 100,
          sortBy: 'name',
          sortDirection: 'asc'
        })
    })
      .pipe(
        finalize(
          () =>
            this.loadingState.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.productsState.set(
            response.products.data.items
          );

          this.warehousesState.set(
            response.warehouses.data.items
          );
        },

        error: error => {
          this.errorState.set(
            error?.error?.message
            ?? 'Form seçenekleri yüklenemedi.'
          );
        }
      });
  }

  create(
    payload:
      CreateTransferRequestPayload
  ): Observable<TransferRequest> {
    return this.transferFacade
      .create(payload);
  }
}
