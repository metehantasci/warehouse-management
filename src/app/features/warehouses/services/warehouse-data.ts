import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable,
  inject
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
  Warehouse
} from '../models/warehouse';


@Injectable({
  providedIn: 'root'
})
export class WarehouseDataService {

  private readonly http =
    inject(HttpClient);

  private readonly endpoint =
    '/api/warehouses';


  getAll(
    query: QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<Warehouse>
    >
  > {
    return this.http.get<
      ApiResponse<
        PaginatedResult<Warehouse>
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
    ApiResponse<Warehouse>
  > {
    return this.http.get<
      ApiResponse<Warehouse>
    >(
      `${this.endpoint}/${id}`
    );
  }


  create(
    warehouse: Warehouse
  ): Observable<
    ApiResponse<Warehouse>
  > {
    return this.http.post<
      ApiResponse<Warehouse>
    >(
      this.endpoint,
      warehouse
    );
  }


  update(
    id: string,
    changes: Partial<Warehouse>
  ): Observable<
    ApiResponse<Warehouse>
  > {
    return this.http.patch<
      ApiResponse<Warehouse>
    >(
      `${this.endpoint}/${id}`,
      changes
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
      `${this.endpoint}/${id}`
    );
  }


  private buildParams(
    query: QueryParams
  ): HttpParams {

    let params =
      new HttpParams()
        .set(
          'page',
          query.page.toString()
        )
        .set(
          'pageSize',
          query.pageSize.toString()
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
        const [
          key,
          value
        ]
        of Object.entries(
          query.filters
        )
      ) {
        if (
          value !== null &&
          value !== undefined
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
