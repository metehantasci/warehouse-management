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
  LowStockRule
} from '../models/low-stock-rule';


export interface CreateLowStockRulePayload {
  productId: string;
  warehouseId?: string;
  minQuantity: number;
}


export interface UpdateLowStockRulePayload {
  warehouseId?: string;
  minQuantity?: number;
  isActive?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class LowStockRuleDataService {

  private readonly http =
    inject(HttpClient);


  private readonly endpoint =
    '/api/low-stock-rules';


  getAll(
    query: QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<LowStockRule>
    >
  > {

    return this.http.get<
      ApiResponse<
        PaginatedResult<LowStockRule>
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
    ApiResponse<LowStockRule>
  > {

    return this.http.get<
      ApiResponse<LowStockRule>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}`
    );
  }


  create(
    payload:
      CreateLowStockRulePayload
  ): Observable<
    ApiResponse<LowStockRule>
  > {

    return this.http.post<
      ApiResponse<LowStockRule>
    >(
      this.endpoint,
      payload
    );
  }


  update(
    id: string,

    payload:
      UpdateLowStockRulePayload
  ): Observable<
    ApiResponse<LowStockRule>
  > {

    return this.http.patch<
      ApiResponse<LowStockRule>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}`,
      payload
    );
  }


  delete(
    id: string
  ): Observable<
    ApiResponse<{
      id: string;
    }>
  > {

    return this.http.delete<
      ApiResponse<{
        id: string;
      }>
    >(
      `${this.endpoint}/${encodeURIComponent(id)}`
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
