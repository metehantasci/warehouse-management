import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  catchError,
  finalize,
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
  NotificationService
} from '../../../core/services/notification';

import {
  Shipment
} from '../models/shipment';

import {
  CreateShipmentPayload,
  ShipmentDataService
} from './shipment-data';


const EMPTY_RESULT:
  PaginatedResult<Shipment> = {

    items:
      [],

    page:
      1,

    pageSize:
      10,

    totalItems:
      0,

    totalPages:
      0,

    hasPreviousPage:
      false,

    hasNextPage:
      false
  };


interface ShipmentState {

  result:
    PaginatedResult<Shipment>;

  selected:
    Shipment | null;

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
  ShipmentState = {

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
      page:
        1,

      pageSize:
        10,

      sortBy:
        'createdAt',

      sortDirection:
        'desc'
    }
  };


@Injectable({
  providedIn:
    'root'
})
export class ShipmentFacadeService {

  private readonly data =
    inject(
      ShipmentDataService
    );


  private readonly notification =
    inject(
      NotificationService
    );


  private readonly state =
    signal<ShipmentState>(
      INITIAL_STATE
    );


  readonly result =
    computed(
      () =>
        this.state().result
    );


  readonly shipments =
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
      .getAll(
        query
      )
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


  reload():
    void {

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
      .getById(
        id
      )
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
      CreateShipmentPayload
  ): Observable<Shipment> {

    return this.data
      .create(
        payload
      )
      .pipe(
        map(
          response =>
            response.data
        ),

        tap(
          shipment => {

            this.upsertShipment(
              shipment,
              true
            );


            this.notification.success(
              'Sevkiyat planlandı.'
            );
          }
        ),

        catchError(
          error => {

            this.setError(
              error
            );


            return throwError(
              () => error
            );
          }
        )
      );
  }


  confirm(
    id:
      string
  ): Observable<Shipment> {

    return this.runStatusAction(
      this.data.confirm(
        id
      ),
      'Sevkiyat onaylandı.'
    );
  }


  ship(
    id:
      string
  ): Observable<Shipment> {

    return this.runStatusAction(
      this.data.ship(
        id
      ),
      'Sevkiyat gönderildi.'
    );
  }


  deliver(
    id:
      string
  ): Observable<Shipment> {

    return this.runStatusAction(
      this.data.deliver(
        id
      ),
      'Sevkiyat teslim edildi.'
    );
  }


  cancel(
    id:
      string,

    reason:
      string
  ): Observable<Shipment> {

    if (!reason?.trim()) {

      return throwError(
        () =>
          new Error(
            'İptal nedeni zorunludur.'
          )
      );
    }


    return this.runStatusAction(
      this.data.cancel(
        id,
        {
          reason:
            reason.trim()
        }
      ),
      'Sevkiyat iptal edildi.'
    );
  }


  clearSelected():
    void {

    this.patchState({
      selected:
        null
    });
  }


  private runStatusAction(
    request:
      Observable<{
        data: Shipment;
      }>,

    successMessage:
      string
  ): Observable<Shipment> {

    return request.pipe(

      map(
        response =>
          response.data
      ),

      tap(
        shipment => {

          this.upsertShipment(
            shipment,
            false
          );


          this.notification.success(
            successMessage
          );
        }
      ),

      catchError(
        error => {

          this.setError(
            error
          );


          return throwError(
            () => error
          );
        }
      )
    );
  }


  private upsertShipment(
    shipment:
      Shipment,

    isNew:
      boolean
  ): void {

    const currentResult =
      this.state().result;


    const exists =
      currentResult.items.some(
        item =>
          item.id ===
            shipment.id
      );


    const nextItems =
      exists

        ? currentResult.items.map(
            item =>
              item.id ===
                shipment.id
                ? shipment
                : item
          )

        : [
            shipment,
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
          this.sortShipments(
            nextItems
          ),

        totalItems:
          isNew && !exists
            ? currentResult.totalItems + 1
            : currentResult.totalItems
      },

      selected:
        this.state().selected?.id ===
          shipment.id
          ? shipment
          : this.state().selected
    });
  }


  private sortShipments(
    shipments:
      readonly Shipment[]
  ): Shipment[] {

    return shipments
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


  private setError(
    error:
      unknown
  ): void {

    this.patchState({
      error:
        this.getErrorMessage(
          error
        )
    });
  }


  private patchState(
    patch:
      Partial<ShipmentState>
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
      'Sevkiyat işlemi sırasında beklenmeyen bir hata oluştu.'
    );
  }
}
