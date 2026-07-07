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
  Product
} from '../models/product';

import {
  ProductDataService
} from './product-data';


const EMPTY_RESULT:
  PaginatedResult<Product> = {

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
export class ProductFacadeService {

  private readonly dataService =
    inject(ProductDataService);

  private readonly notification =
    inject(NotificationService);


  private readonly resultState =
    signal<
      PaginatedResult<Product>
    >(
      EMPTY_RESULT
    );


  private readonly selectedProductState =
    signal<Product | null>(
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


  readonly products =
    computed(
      () =>
        this.resultState().items
    );


  readonly selectedProduct =
    this.selectedProductState
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


  readonly hasProducts =
    computed(
      () =>
        this.resultState()
          .items.length > 0
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
          this.selectedProductState.set(
            response.data
          );
        },

        error: error => {

          this.selectedProductState.set(
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
    product: Product,

    onSuccess?: (
      created: Product
    ) => void
  ): void {

    this.loadingState.set(true);
    this.errorState.set(null);


    this.dataService
      .create(product)
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
            'Ürün başarıyla oluşturuldu.'
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
      Partial<Product>,

    onSuccess?: (
      updated: Product
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

          this.selectedProductState.set(
            response.data
          );

          this.notification.success(
            'Ürün başarıyla güncellendi.'
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
            'Ürün pasife alındı.'
          );

          this.resultState.update(
            result => ({
              ...result,

              items:
                result.items.map(
                  product =>
                    product.id === id
                      ? {
                          ...product,
                          isActive: false
                        }
                      : product
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
    this.selectedProductState.set(
      null
    );
  }


  clearError(): void {
    this.errorState.set(
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


    return 'Ürün işlemi sırasında hata oluştu.';
  }
}
