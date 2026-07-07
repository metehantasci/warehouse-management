import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  finalize
} from 'rxjs';

import {
  PaginatedResult
} from '../../../core/models/paginated-result';

import {
  QueryParams
} from '../../../core/models/query-params';

import {
  NotificationService
} from '../../../core/services/notification';

import {
  Warehouse
} from '../models/warehouse';

import {
  WarehouseDataService
} from './warehouse-data';


const EMPTY_RESULT:
  PaginatedResult<Warehouse> = {

    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };


@Injectable({
  providedIn: 'root'
})
export class WarehouseFacadeService {

  private readonly dataService =
    inject(WarehouseDataService);

  private readonly notification =
    inject(NotificationService);


  private readonly resultState =
    signal<
      PaginatedResult<Warehouse>
    >(
      EMPTY_RESULT
    );


  private readonly selectedWarehouseState =
    signal<Warehouse | null>(
      null
    );


  private readonly loadingState =
    signal(false);


  private readonly errorState =
    signal<string | null>(
      null
    );


  readonly result =
    this.resultState.asReadonly();


  readonly warehouses =
    computed(
      () =>
        this.resultState().items
    );


  readonly selectedWarehouse =
    this.selectedWarehouseState
      .asReadonly();


  readonly isLoading =
    this.loadingState.asReadonly();


  readonly error =
    this.errorState.asReadonly();


  readonly totalItems =
    computed(
      () =>
        this.resultState()
          .totalItems
    );


  load(
    query: QueryParams
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .getAll(query)
      .pipe(
        finalize(
          () =>
            this.loadingState.set(
              false
            )
        )
      )
      .subscribe({

        next: response => {
          this.resultState.set(
            response.data
          );
        },

        error: error => {
          this.errorState.set(
            this.resolveErrorMessage(
              error
            )
          );
        }
      });
  }


  loadById(
    id: string
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .getById(id)
      .pipe(
        finalize(
          () =>
            this.loadingState.set(
              false
            )
        )
      )
      .subscribe({

        next: response => {
          this.selectedWarehouseState.set(
            response.data
          );
        },

        error: error => {

          this.selectedWarehouseState.set(
            null
          );

          this.errorState.set(
            this.resolveErrorMessage(
              error
            )
          );
        }
      });
  }


  create(
    warehouse: Warehouse,

    onSuccess?: (
      created: Warehouse
    ) => void
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .create(warehouse)
      .pipe(
        finalize(
          () =>
            this.loadingState.set(
              false
            )
        )
      )
      .subscribe({

        next: response => {

          this.notification.success(
            'Depo başarıyla oluşturuldu.'
          );

          onSuccess?.(
            response.data
          );
        },

        error: error => {
          this.errorState.set(
            this.resolveErrorMessage(
              error
            )
          );
        }
      });
  }


  update(
    id: string,

    changes:
      Partial<Warehouse>,

    onSuccess?: (
      updated: Warehouse
    ) => void
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .update(
        id,
        changes
      )
      .pipe(
        finalize(
          () =>
            this.loadingState.set(
              false
            )
        )
      )
      .subscribe({

        next: response => {

          this.selectedWarehouseState.set(
            response.data
          );

          this.notification.success(
            'Depo başarıyla güncellendi.'
          );

          onSuccess?.(
            response.data
          );
        },

        error: error => {
          this.errorState.set(
            this.resolveErrorMessage(
              error
            )
          );
        }
      });
  }


  remove(
    id: string,
    onSuccess?: () => void
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .delete(id)
      .pipe(
        finalize(
          () =>
            this.loadingState.set(
              false
            )
        )
      )
      .subscribe({

        next: () => {

          this.notification.success(
            'Depo pasife alındı.'
          );

          this.resultState.update(
            result => ({
              ...result,

              items:
                result.items.map(
                  warehouse =>
                    warehouse.id === id
                      ? {
                          ...warehouse,
                          isActive: false
                        }
                      : warehouse
                )
            })
          );

          onSuccess?.();
        },

        error: error => {
          this.errorState.set(
            this.resolveErrorMessage(
              error
            )
          );
        }
      });
  }


  clearSelected(): void {
    this.selectedWarehouseState.set(
      null
    );
  }


  private resolveErrorMessage(
    error: unknown
  ): string {

    if (
      typeof error === 'object'
      &&
      error !== null
      &&
      'error' in error
    ) {

      const nested =
        (
          error as {
            error?: {
              message?: unknown;
            };
          }
        ).error;


      if (
        typeof nested?.message ===
        'string'
      ) {
        return nested.message;
      }
    }


    return 'Depo işlemi sırasında hata oluştu.';
  }
}
