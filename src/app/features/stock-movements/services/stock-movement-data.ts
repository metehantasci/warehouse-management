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
  StockBalance
} from '../models/stock-balance';

import {
  StockMovement
} from '../models/stock-movement';

import {
  CreateStockMovementPayload
} from './stock-movement-domain';


@Injectable({
  providedIn: 'root'
})
export class StockMovementDataService {

  private readonly http =
    inject(HttpClient);


  private readonly baseUrl =
    '/api/stock-movements';


  getAll(
    query:
      QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<
        StockMovement
      >
    >
  > {

    return this.http.get<
      ApiResponse<
        PaginatedResult<
          StockMovement
        >
      >
    >(
      this.baseUrl,
      {
        params:
          this.buildParams(
            query
          )
      }
    );
  }


  getById(
    id:
      string
  ): Observable<
    ApiResponse<
      StockMovement
    >
  > {

    return this.http.get<
      ApiResponse<
        StockMovement
      >
    >(
      `${this.baseUrl}/${encodeURIComponent(id)}`
    );
  }


  getBalances():
    Observable<
      ApiResponse<
        StockBalance[]
      >
    > {

    return this.http.get<
      ApiResponse<
        StockBalance[]
      >
    >(
      `${this.baseUrl}/balances`
    );
  }


  create(
    payload:
      CreateStockMovementPayload
  ): Observable<
    ApiResponse<
      StockMovement
    >
  > {

    return this.http.post<
      ApiResponse<
        StockMovement
      >
    >(
      this.baseUrl,
      payload
    );
  }


  cancel(
    id:
      string,

    reason:
      string
  ): Observable<
    ApiResponse<
      StockMovement
    >
  > {

    return this.http.patch<
      ApiResponse<
        StockMovement
      >
    >(
      `${this.baseUrl}/${encodeURIComponent(id)}/cancel`,
      {
        reason
      }
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


    if (
      query.search?.trim()
    ) {
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


    if (
      query.sortDirection
    ) {
      params =
        params.set(
          'sortDirection',
          query.sortDirection
        );
    }


    if (query.filters) {

      for (
        const [
          key,
          value
        ]
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
