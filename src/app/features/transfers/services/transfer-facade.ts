import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  catchError,
  finalize,
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
  NotificationService
} from '../../../core/services/notification';

import {
  TransferRequest
} from '../models/transfer-request';

import {
  CreateTransferRequestPayload,
  TransferDataService
} from './transfer-data';


const EMPTY_RESULT:
  PaginatedResult<TransferRequest> = {

    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };


interface TransferState {

  result:
    PaginatedResult<TransferRequest>;

  selected:
    TransferRequest | null;

  loading:
    boolean;

  loaded:
    boolean;

  error:
    string | null;

  lastQuery:
    QueryParams;
}


const INITIAL_STATE:
  TransferState = {

    result:
      EMPTY_RESULT,

    selected:
      null,

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
export class TransferFacadeService {

  private readonly data =
    inject(
      TransferDataService
    );


  private readonly notification =
    inject(
      NotificationService
    );


  private readonly state =
    signal<TransferState>(
      INITIAL_STATE
    );


  readonly result =
    computed(
      () =>
        this.state().result
    );


  readonly transfers =
    computed(
      () =>
        this.state()
          .result
          .items
    );


  readonly selected =
    computed(
      () =>
        this.state().selected
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


  readonly hasTransfers =
    computed(
      () =>
        this.state()
          .result
          .items
          .length > 0
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


    this.data
      .getAll(query)
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


  reload(): void {

    this.load(
      this.state().lastQuery
    );
  }


  loadById(
    id:
      string
  ): void {

    this.patchState({
      loading:
        true,

      error:
        null
    });


    this.data
      .getById(id)
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
              selected:
                response.data,

              error:
                null
            });
          },


        error:
          error => {

            this.patchState({
              selected:
                null,

              error:
                this.getErrorMessage(
                  error
                )
            });
          }
      });
  }


  create(
    payload:
      CreateTransferRequestPayload
  ): Observable<TransferRequest> {

    this.patchState({
      error:
        null
    });


    return new Observable<
      TransferRequest
    >(
      subscriber => {

        const subscription =
          this.data
            .create(payload)
            .subscribe({

              next:
                response => {

                  const created =
                    response.data;


                  this.upsertTransfer(
                    created,
                    true
                  );


                  this.notification.success(
                    'Transfer talebi oluşturuldu.'
                  );


                  subscriber.next(
                    created
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


  approve(
    id:
      string
  ): Observable<TransferRequest> {

    this.patchState({
      error:
        null
    });


    return this.data
      .approve(id)
      .pipe(
        tap(
          response => {

            this.upsertTransfer(
              response.data,
              false
            );


            this.notification.success(
              'Transfer onaylandı.'
            );
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
      )
      .pipe(
        this.unwrapResponse()
      );
  }


  cancel(
    id:
      string,

    reason:
      string
  ): Observable<TransferRequest> {

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
        {
          reason:
            reason.trim()
        }
      )
      .pipe(
        tap(
          response => {

            this.upsertTransfer(
              response.data,
              false
            );


            this.notification.success(
              'Transfer iptal edildi.'
            );
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
      )
      .pipe(
        this.unwrapResponse()
      );
  }


  clearSelected(): void {

    this.patchState({
      selected:
        null
    });
  }


  clearError(): void {

    this.patchState({
      error:
        null
    });
  }


  private unwrapResponse() {

    return (
      source:
        Observable<{
          data: TransferRequest;
        }>
    ) =>
      new Observable<
        TransferRequest
      >(
        subscriber => {

          const subscription =
            source.subscribe({

              next:
                response => {
                  subscriber.next(
                    response.data
                  );
                },

              error:
                error => {
                  subscriber.error(
                    error
                  );
                },

              complete:
                () => {
                  subscriber.complete();
                }
            });


          return () =>
            subscription.unsubscribe();
        }
      );
  }


  private upsertTransfer(
    transfer:
      TransferRequest,

    isNew:
      boolean
  ): void {

    const currentResult =
      this.state().result;


    const exists =
      currentResult.items.some(
        item =>
          item.id ===
            transfer.id
      );


    const nextItems =
      exists
        ? currentResult.items.map(
            item =>
              item.id ===
                transfer.id
                ? transfer
                : item
          )
        : [
            transfer,
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
          this.sortTransfers(
            nextItems
          ),

        totalItems:
          isNew && !exists
            ? currentResult.totalItems + 1
            : currentResult.totalItems
      },

      selected:
        this.state().selected?.id ===
          transfer.id
          ? transfer
          : this.state().selected
    });
  }


  private sortTransfers(
    transfers:
      readonly TransferRequest[]
  ): TransferRequest[] {

    return transfers
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
      Partial<TransferState>
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
      'Transfer işlemi sırasında beklenmeyen bir hata oluştu.'
    );
  }
}
