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
  TransferRequest
} from '../models/transfer-request';


export interface CreateTransferRequestPayload {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  note?: string;
}


export interface CancelTransferPayload {
  reason: string;
}


@Injectable({
  providedIn: 'root'
})
export class TransferDataService {

  private readonly http =
    inject(HttpClient);

  private readonly endpoint =
    '/api/transfers';


  getAll(
    query: QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<TransferRequest>
    >
  > {

    return this.http.get<
      ApiResponse<
        PaginatedResult<TransferRequest>
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
    id: string
  ): Observable<
    ApiResponse<TransferRequest>
  > {

    return this.http.get<
      ApiResponse<TransferRequest>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}`
    );
  }


  create(
    payload:
      CreateTransferRequestPayload
  ): Observable<
    ApiResponse<TransferRequest>
  > {

    return this.http.post<
      ApiResponse<TransferRequest>
    >(
      this.endpoint,
      payload
    );
  }


  approve(
    id: string
  ): Observable<
    ApiResponse<TransferRequest>
  > {

    return this.http.patch<
      ApiResponse<TransferRequest>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/approve`,
      {}
    );
  }


  cancel(
    id: string,
    payload: CancelTransferPayload
  ): Observable<
    ApiResponse<TransferRequest>
  > {

    return this.http.patch<
      ApiResponse<TransferRequest>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}/cancel`,
      payload
    );
  }


  private buildParams(
    query: QueryParams
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
