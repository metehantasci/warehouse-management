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
  Product
} from '../models/product';


@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

  private readonly http =
    inject(HttpClient);

  private readonly endpoint =
    '/api/products';


  getAll(
    query: QueryParams
  ): Observable<
    ApiResponse<
      PaginatedResult<Product>
    >
  > {
    return this.http.get<
      ApiResponse<
        PaginatedResult<Product>
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
    ApiResponse<Product>
  > {
    return this.http.get<
      ApiResponse<Product>
    >(
      `${this.endpoint}/${id}`
    );
  }


  create(
    product: Product
  ): Observable<
    ApiResponse<Product>
  > {
    return this.http.post<
      ApiResponse<Product>
    >(
      this.endpoint,
      product
    );
  }


  update(
    id: string,
    changes: Partial<Product>
  ): Observable<
    ApiResponse<Product>
  > {
    return this.http.patch<
      ApiResponse<Product>
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
