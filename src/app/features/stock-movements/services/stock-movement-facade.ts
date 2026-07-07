import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  catchError,
  finalize,
  forkJoin,
  map,
  Observable,
  tap,
  throwError
} from 'rxjs';

import {
  PaginatedResult
} from '../../../core/models/paginated-result';

import {
  QueryParams
} from '../../../core/models/query-params';

import {
  StockBalance
} from '../models/stock-balance';

import {
  StockMovement
} from '../models/stock-movement';

import {
  AdjustmentMovementRequest,
  BaseMovementRequest,
  CreateStockMovementPayload,
  ShipmentMovementRequest,
  StockMovementDomainService,
  TransferMovementRequest
} from './stock-movement-domain';

import {
  StockMovementDataService
} from './stock-movement-data';


const EMPTY_RESULT:
  PaginatedResult<StockMovement> = {

    items: [],

    page: 1,

    pageSize: 10,

    totalItems: 0,

    totalPages: 0,

    hasPreviousPage: false,

    hasNextPage: false
  };


interface StockMovementState {
  result:
    PaginatedResult<
      StockMovement
    >;

  balances:
    StockBalance[];

  loading:
    boolean;

  loaded:
    boolean;

  error:
    string | null;

  lastQuery:
    QueryParams;
}


const initialState:
  StockMovementState = {

    result:
      EMPTY_RESULT,

    balances:
      [],

    loading:
      false,

    loaded:
      false,

    error:
      null,

    lastQuery: {
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    }
  };


@Injectable({
  providedIn: 'root'
})
export class StockMovementFacadeService {

  private readonly data =
    inject(
      StockMovementDataService
    );


  private readonly domain =
    inject(
      StockMovementDomainService
    );


  private readonly state =
    signal<StockMovementState>(
      initialState
    );


  readonly result =
    computed(
      () =>
        this.state().result
    );


  readonly movements =
    computed(
      () =>
        this.state()
          .result
          .items
    );


  readonly balances =
    computed(
      () =>
        this.state().balances
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


  readonly totalItems =
    computed(
      () =>
        this.state()
          .result
          .totalItems
    );


  load(
    query:
      QueryParams =
        this.state().lastQuery
  ): void {

    if (
      this.state().loading
    ) {
      return;
    }


    this.patchState({
      loading:
        true,

      error:
        null,

      lastQuery:
        query
    });


    forkJoin({
      list:
        this.data.getAll(
          query
        ),

      balances:
        this.data.getBalances()
    })
      .pipe(
        finalize(
          () => {
            this.patchState({
              loading:
                false
            });
          }
        )
      )
      .subscribe({

        next:
          response => {

            this.patchState({
              result:
                response.list.data,

              balances:
                response.balances.data,

              loaded:
                true,

              error:
                null
            });
          },


        error:
          error => {

            this.patchState({
              error:
                this.getErrorMessage(
                  error
                ),

              loaded:
                false
            });
          }
      });
  }


  reload(): void {

    this.load(
      this.state().lastQuery
    );
  }


  getBalance(
    productId:
      string,

    warehouseId:
      string
  ): number {

    return (
      this.state()
        .balances
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


  hasSufficientStock(
    productId:
      string,

    warehouseId:
      string,

    quantity:
      number
  ): boolean {

    if (
      !Number.isFinite(
        quantity
      )
      ||
      quantity <= 0
    ) {
      return false;
    }


    return (
      this.getBalance(
        productId,
        warehouseId
      )
      >= quantity
    );
  }


  stockIn(
    request:
      BaseMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildStockIn(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  stockOut(
    request:
      BaseMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildStockOut(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  adjustTo(
    request:
      AdjustmentMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildAdjustment(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  recordTransferOut(
    request:
      TransferMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildTransferOut(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  recordTransferIn(
    request:
      TransferMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildTransferIn(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  recordShipmentOut(
    request:
      ShipmentMovementRequest
  ): Observable<
    StockMovement
  > {

    const payload =
      this.domain.buildShipmentOut(
        request
      );


    return this.persistMovement(
      payload
    );
  }


  cancelMovement(
    id:
      string,

    reason:
      string
  ): Observable<
    StockMovement
  > {

    if (!reason?.trim()) {

      return throwError(
        () =>
          new Error(
            'İptal nedeni zorunludur.'
          )
      );
    }


    this.patchState({
      error:
        null
    });


    return this.data
      .cancel(
        id,
        reason.trim()
      )
      .pipe(
        map(
          response =>
            response.data
        ),

        tap(
          updatedMovement => {
            this.upsertMovement(
              updatedMovement
            );

            this.refreshBalances();
          }
        ),

        catchError(
          error => {

            this.patchState({
              error:
                this.getErrorMessage(
                  error
                )
            });


            return throwError(
              () => error
            );
          }
        )
      );
  }


  private persistMovement(
    payload:
      CreateStockMovementPayload
  ): Observable<
    StockMovement
  > {

    this.patchState({
      error:
        null
    });


    return new Observable<
      StockMovement
    >(
      subscriber => {

        const subscription =
          this.data
            .create(
              payload
            )
            .subscribe({

              next:
                response => {

                  const movement =
                    response.data;


                  this.upsertMovement(
                    movement
                  );


                  this.refreshBalances();


                  subscriber.next(
                    movement
                  );


                  subscriber.complete();
                },


              error:
                error => {

                  this.patchState({
                    error:
                      this.getErrorMessage(
                        error
                      )
                  });


                  subscriber.error(
                    error
                  );
                }
            });


        return () =>
          subscription.unsubscribe();
      }
    );
  }


  private refreshBalances():
    void {

    this.data
      .getBalances()
      .subscribe({

        next:
          response => {

            this.patchState({
              balances:
                response.data
            });
          },


        error:
          error => {

            this.patchState({
              error:
                this.getErrorMessage(
                  error
                )
            });
          }
      });
  }


  private upsertMovement(
    movement:
      StockMovement
  ): void {

    const currentResult =
      this.state().result;


    const exists =
      currentResult.items.some(
        item =>
          item.id ===
            movement.id
      );


    const nextItems =
      exists
        ? currentResult.items.map(
            item =>
              item.id ===
                movement.id
                ? movement
                : item
          )
        : [
            movement,
            ...currentResult.items
          ]
            .slice(
              0,
              currentResult.pageSize
            );


    this.patchState({
      result: {
        ...currentResult,

        items:
          this.sortMovements(
            nextItems
          ),

        totalItems:
          exists
            ? currentResult.totalItems
            : currentResult.totalItems + 1
      }
    });
  }


  private sortMovements(
    movements:
      readonly StockMovement[]
  ): StockMovement[] {

    return movements
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
      );
  }


  private patchState(
    patch:
      Partial<
        StockMovementState
      >
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
      typeof error ===
        'object'
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
      'Stok hareketi işlemi sırasında beklenmeyen bir hata oluştu.'
    );
  }
}

