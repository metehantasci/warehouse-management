import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  MockDbCollectionName
} from '../../models/mock-db.types';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';


interface EntityWithId {
  id: string;
}


export interface MockCrudHandlerOptions {
  collection:
    MockDbCollectionName;

  entityLabel:
    string;
}


export class GenericMockCrudHandler<
  T extends EntityWithId
> {

  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly options:
      MockCrudHandlerOptions
  ) {}


  handle(
    request:
      HttpRequest<unknown>,

    entityId:
      string | null
  ): HttpResponse<unknown> {
    switch (request.method) {

      case 'GET':
        return entityId
          ? this.getById(entityId)
          : this.getAll(request);


      case 'POST':
        return this.create(request);


      case 'PUT':
      case 'PATCH':
        if (!entityId) {
          throw this.badRequest(
            'Güncellenecek kayıt kimliği eksik.'
          );
        }

        return this.update(
          entityId,
          request
        );


      case 'DELETE':
        if (!entityId) {
          throw this.badRequest(
            'Silinecek kayıt kimliği eksik.'
          );
        }

        return this.delete(
          entityId
        );


      default:
        throw new HttpErrorResponse({
          status: 405,
          statusText:
            'Method Not Allowed',

          error:
            this.runtime.error(
              'Bu HTTP metodu desteklenmiyor.',
              'METHOD_NOT_ALLOWED'
            )
        });
    }
  }


  private getAll(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    let items =
      this.db.getAll<T>(
        this.options.collection
      );


    const search =
      request.params
        .get('search')
        ?.trim()
        .toLocaleLowerCase('tr-TR');


    if (search) {
      items =
        items.filter(item =>
          JSON.stringify(item)
            .toLocaleLowerCase('tr-TR')
            .includes(search)
        );
    }


    const sortBy =
      request.params.get('sortBy');


    const sortDirection =
      request.params.get(
        'sortDirection'
      ) ?? 'asc';


    if (sortBy) {
      items = [
        ...items
      ].sort(
        (first, second) => {
          const firstValue =
            (first as Record<string, unknown>)[
              sortBy
            ];

          const secondValue =
            (second as Record<string, unknown>)[
              sortBy
            ];

          const comparison =
            String(firstValue ?? '')
              .localeCompare(
                String(
                  secondValue ?? ''
                ),
                'tr-TR',
                {
                  numeric: true
                }
              );

          return sortDirection === 'desc'
            ? -comparison
            : comparison;
        }
      );
    }


    const page =
      Math.max(
        1,
        Number(
          request.params.get('page')
          ?? 1
        )
      );


    const pageSize =
      Math.max(
        1,
        Number(
          request.params.get('pageSize')
          ?? 10
        )
      );


    const totalItems =
      items.length;


    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems / pageSize
        )
      );


    const startIndex =
      (page - 1) * pageSize;


    const pagedItems =
      items.slice(
        startIndex,
        startIndex + pageSize
      );


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success({
          items: pagedItems,
          page,
          pageSize,
          totalItems,
          totalPages,
          hasPreviousPage:
            page > 1,
          hasNextPage:
            page < totalPages
        })
    });
  }


  private getById(
    id: string
  ): HttpResponse<unknown> {

    const item =
      this.db.getById<T>(
        this.options.collection,
        id
      );


    if (!item) {
      throw new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',

        error:
          this.runtime.error(
            `${this.options.entityLabel} bulunamadı.`,
            'ENTITY_NOT_FOUND',
            {
              id
            }
          )
      });
    }


    return new HttpResponse({
      status: 200,
      body:
        this.runtime.success(item)
    });
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const entity =
      request.body as T;


    if (!entity?.id) {
      throw this.badRequest(
        'Yeni kayıt için id alanı zorunludur.'
      );
    }


    const created =
      this.db.create<T>(
        this.options.collection,
        entity
      );


    return new HttpResponse({
      status: 201,
      body:
        this.runtime.success(
          created,
          `${this.options.entityLabel} oluşturuldu.`
        )
    });
  }


  private update(
    id: string,
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const patch =
      request.body as Partial<T>;


    const updated =
      this.db.update<T>(
        this.options.collection,
        id,
        current => ({
          ...current,
          ...patch,
          id
        })
      );


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          updated,
          `${this.options.entityLabel} güncellendi.`
        )
    });
  }


  private delete(
    id: string
  ): HttpResponse<unknown> {

    const deleted =
      this.db.deleteById<T>(
        this.options.collection,
        id
      );


    if (!deleted) {
      throw new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',

        error:
          this.runtime.error(
            `${this.options.entityLabel} bulunamadı.`,
            'ENTITY_NOT_FOUND',
            {
              id
            }
          )
      });
    }


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          {
            id
          },
          `${this.options.entityLabel} silindi.`
        )
    });
  }


  private badRequest(
    message: string
  ): HttpErrorResponse {
    return new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',

      error:
        this.runtime.error(
          message,
          'BAD_REQUEST'
        )
    });
  }
}
