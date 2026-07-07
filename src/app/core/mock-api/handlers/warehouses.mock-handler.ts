import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  AuditActionType
} from '../../models/audit-action-type.enum';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';

import {
  GenericMockCrudHandler
} from './generic-crud.mock-handler';


export class WarehousesMockHandler {

  private readonly genericHandler:
    GenericMockCrudHandler<Warehouse>;


  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly auditLog:
      AuditLogService
  ) {
    this.genericHandler =
      new GenericMockCrudHandler<Warehouse>(
        db,
        runtime,
        {
          collection: 'warehouses',
          entityLabel: 'Depo'
        }
      );
  }


  handle(
    request:
      HttpRequest<unknown>,

    entityId:
      string | null
  ): HttpResponse<unknown> {

    switch (request.method) {

      case 'POST':
        return this.create(request);

      case 'PUT':
      case 'PATCH':
        if (!entityId) {
          throw this.badRequest(
            'Güncellenecek depo kimliği eksik.'
          );
        }

        return this.update(
          entityId,
          request
        );

      case 'DELETE':
        if (!entityId) {
          throw this.badRequest(
            'Silinecek depo kimliği eksik.'
          );
        }

        return this.softDelete(
          entityId
        );

      default:
        return this.genericHandler.handle(
          request,
          entityId
        );
    }
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const warehouse =
      request.body as Warehouse;


    if (!warehouse?.id) {
      throw this.badRequest(
        'Depo id alanı zorunludur.'
      );
    }


    if (!warehouse.code?.trim()) {
      throw this.badRequest(
        'Depo kodu zorunludur.'
      );
    }


    if (!warehouse.name?.trim()) {
      throw this.badRequest(
        'Depo adı zorunludur.'
      );
    }


    this.ensureUniqueCode(
      warehouse.code
    );


    const now =
      new Date().toISOString();


    const entity:
      Warehouse = {

        ...warehouse,

        code:
          warehouse.code.trim(),

        name:
          warehouse.name.trim(),

        isActive:
          warehouse.isActive ?? true,

        createdAt:
          warehouse.createdAt || now,

        updatedAt:
          now
      };


    this.db.create<Warehouse>(
      'warehouses',
      entity
    );


    this.auditLog.record({
      action:
        AuditActionType.CREATE,

      entityType:
        'Warehouse',

      entityId:
        entity.id,

      description:
        `Depo oluşturuldu: ${entity.name}`,

      newValue:
        entity
    });


    return new HttpResponse({
      status: 201,

      body:
        this.runtime.success(
          entity,
          'Depo oluşturuldu.'
        )
    });
  }


  private update(
    id: string,
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<Warehouse>(
        'warehouses',
        id
      );


    if (!current) {
      throw this.notFound(id);
    }


    const patch =
      request.body as Partial<Warehouse>;


    const nextCode =
      patch.code !== undefined
        ? patch.code.trim()
        : current.code;


    const nextName =
      patch.name !== undefined
        ? patch.name.trim()
        : current.name;


    if (!nextCode) {
      throw this.badRequest(
        'Depo kodu boş olamaz.'
      );
    }


    if (!nextName) {
      throw this.badRequest(
        'Depo adı boş olamaz.'
      );
    }


    this.ensureUniqueCode(
      nextCode,
      id
    );


    const updated:
      Warehouse = {

        ...current,
        ...patch,

        id:
          current.id,

        code:
          nextCode,

        name:
          nextName,

        createdAt:
          current.createdAt,

        updatedAt:
          new Date().toISOString()
      };


    this.db.replace<Warehouse>(
      'warehouses',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.UPDATE,

      entityType:
        'Warehouse',

      entityId:
        id,

      description:
        `Depo güncellendi: ${updated.name}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          updated,
          'Depo güncellendi.'
        )
    });
  }


  private softDelete(
    id: string
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<Warehouse>(
        'warehouses',
        id
      );


    if (!current) {
      throw this.notFound(id);
    }


    if (!current.isActive) {
      throw new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',

        error:
          this.runtime.error(
            'Depo zaten pasif durumda.',
            'WAREHOUSE_ALREADY_INACTIVE',
            {
              id
            }
          )
      });
    }


    const updated:
      Warehouse = {

        ...current,

        isActive:
          false,

        updatedAt:
          new Date().toISOString()
      };


    this.db.replace<Warehouse>(
      'warehouses',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.DELETE,

      entityType:
        'Warehouse',

      entityId:
        id,

      description:
        `Depo pasife alındı: ${current.name}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          {
            id
          },
          'Depo pasife alındı.'
        )
    });
  }


  private ensureUniqueCode(
    code: string,
    currentWarehouseId?: string
  ): void {

    const normalized =
      code
        .trim()
        .toLocaleLowerCase('tr-TR');


    const duplicate =
      this.db.exists<Warehouse>(
        'warehouses',
        warehouse =>
          warehouse.id !==
            currentWarehouseId
          &&
          warehouse.code
            .trim()
            .toLocaleLowerCase('tr-TR')
            === normalized
      );


    if (duplicate) {
      throw new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',

        error:
          this.runtime.error(
            'Bu depo kodu zaten kullanılıyor.',
            'WAREHOUSE_CODE_ALREADY_EXISTS',
            {
              code
            }
          )
      });
    }
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


  private notFound(
    id: string
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',

      error:
        this.runtime.error(
          'Depo bulunamadı.',
          'WAREHOUSE_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
