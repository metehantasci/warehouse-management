import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  ApiResponse
} from '../../../core/models/api-response';

import {
  PaginatedResult
} from '../../../core/models/paginated-result';

import {
  QueryParams
} from '../../../core/models/query-params';

import {
  Shipment
} from '../models/shipment';


export interface CreateShipmentItemPayload {
  productId: string;
  quantity: number;
}


export interface CreateShipmentPayload {
  sourceWarehouseId: string;
  destinationName: string;
  destinationAddress: string;
  plannedDate: string;
  items: CreateShipmentItemPayload[];
  note?: string;
}


export interface CancelShipmentPayload {
  reason: string;
}


@Injectable({
  providedIn: 'root'
})
export class ShipmentDataService {

  private readonly http =
    inject(HttpClient);


  private readonly endpoint =
    '/api/shipments';


  getAll(
    query:
      QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<Shipment>
    >
  > {

    return this.http.get<
      ApiResponse<
        PaginatedResult<Shipment>
      >
    >(
      this.endpoint,
      {
        params:
          this.buildParams(query)
      }
    );
  }


  getById(
    id:
      string
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.get<
      ApiResponse<Shipment>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}`
    );
  }


  create(
    payload:
      CreateShipmentPayload
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.post<
      ApiResponse<Shipment>
    >(
      this.endpoint,
      payload
    );
  }


  confirm(
    id:
      string
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.patch<
      ApiResponse<Shipment>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/confirm`,
      {}
    );
  }


  ship(
    id:
      string
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.patch<
      ApiResponse<Shipment>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/ship`,
      {}
    );
  }


  deliver(
    id:
      string
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.patch<
      ApiResponse<Shipment>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/deliver`,
      {}
    );
  }


  cancel(
    id:
      string,

    payload:
      CancelShipmentPayload
  ): Observable<
    ApiResponse<Shipment>
  > {

    return this.http.patch<
      ApiResponse<Shipment>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/cancel`,
      payload
    );
  }


  private buildParams(
    query:
      QueryParams
  ): HttpParams {

    let params =
      new HttpParams()
        .set(
          'page',
          String(query.page)
        )
        .set(
          'pageSize',
          String(query.pageSize)
        );


    if (query.search?.trim()) {

      params =
        params.set(
          'search',
          query.search.trim()
        );
    }


    if (query.sortBy) {

      params =
        params.set(
          'sortBy',
          query.sortBy
        );
    }


    if (query.sortDirection) {

      params =
        params.set(
          'sortDirection',
          query.sortDirection
        );
    }


    if (query.filters) {

      for (
        const [key, value]
        of Object.entries(
          query.filters
        )
      ) {

        if (
          value !== null
          &&
          value !== undefined
          &&
          value !== ''
        ) {

          params =
            params.set(
              key,
              String(value)
            );
        }
      }
    }


    return params;
  }
}
