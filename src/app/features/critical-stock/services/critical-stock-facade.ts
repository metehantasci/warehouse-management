import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  finalize
} from 'rxjs';

import {
  ApiResponse
} from '../../../core/models/api-response';

import {
  StockStatus
} from '../../../core/models/stock-status.enum';

import {
  InventoryQuery
} from '../../stock-movements/models/inventory-query';


interface CriticalStockState {

  items:
    InventoryQuery[];

  loading:
    boolean;

  loaded:
    boolean;

  error:
    string | null;
}


const INITIAL_STATE:
  CriticalStockState = {

    items: [],
    loading: false,
    loaded: false,
    error: null
  };


@Injectable({
  providedIn: 'root'
})
export class CriticalStockFacadeService {

  private readonly http =
    inject(HttpClient);


  private readonly state =
    signal<CriticalStockState>(
      INITIAL_STATE
    );


  readonly items =
    computed(
      () =>
        this.state().items
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


  readonly outOfStockCount =
    computed(
      () =>
        this.state()
          .items
          .filter(
            item =>
              item.status ===
                StockStatus.OUT_OF_STOCK
          )
          .length
    );


  readonly criticalCount =
    computed(
      () =>
        this.state()
          .items
          .filter(
            item =>
              item.status ===
                StockStatus.CRITICAL
          )
          .length
    );


  readonly lowCount =
    computed(
      () =>
        this.state()
          .items
          .filter(
            item =>
              item.status ===
                StockStatus.LOW
          )
          .length
    );


  load(
    filters?: {
      productId?: string;
      warehouseId?: string;
      status?: StockStatus;
    }
  ): void {

    if (
      this.state().loading
    ) {
      return;
    }


    this.patchState({
      loading: true,
      error: null
    });


    let params =
      new HttpParams();


    if (filters?.productId) {
      params =
        params.set(
          'productId',
          filters.productId
        );
    }


    if (filters?.warehouseId) {
      params =
        params.set(
          'warehouseId',
          filters.warehouseId
        );
    }


    if (filters?.status) {
      params =
        params.set(
          'status',
          filters.status
        );
    }


    this.http
      .get<
        ApiResponse<
          InventoryQuery[]
        >
      >(
        '/api/critical-stock',
        {
          params
        }
      )
      .pipe(
        finalize(
          () => {
            this.patchState({
              loading: false
            });
          }
        )
      )
      .subscribe({

        next:
          response => {

            this.patchState({
              items:
                response.data,

              loaded:
                true,

              error:
                null
            });
          },


        error:
          error => {

            this.patchState({
              loaded:
                false,

              error:
                this.getErrorMessage(
                  error
                )
            });
          }
      });
  }


  reload():
    void {

    this.load();
  }


  private patchState(
    patch:
      Partial<CriticalStockState>
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
      error
      &&
      typeof error === 'object'
      &&
      'error' in error
    ) {

      const httpError =
        error as {
          error?: {
            message?: string;
          };
        };


      if (
        httpError.error?.message
      ) {
        return (
          httpError.error.message
        );
      }
    }


    if (
      error instanceof Error
    ) {
      return error.message;
    }


    return (
      'Kritik stok verileri yüklenirken hata oluştu.'
    );
  }
}
