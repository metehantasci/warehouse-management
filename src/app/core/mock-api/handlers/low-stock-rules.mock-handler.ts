import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  AuditActionType
} from '../../models/audit-action-type.enum';

import {
  Product
} from '../../../features/products/models/product';

import {
  LowStockRule
} from '../../../features/critical-stock/models/low-stock-rule';

import {
  CreateLowStockRulePayload,
  UpdateLowStockRulePayload
} from '../../../features/critical-stock/services/low-stock-rule-data';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  IdGeneratorService
} from '../../services/id-generator';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';


export class LowStockRulesMockHandler {

  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly auditLog:
      AuditLogService,

    private readonly idGenerator:
      IdGeneratorService
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


      case 'PATCH':
      case 'PUT':

        if (!entityId) {
          throw this.badRequest(
            'Güncellenecek kritik stok kuralı kimliği eksik.'
          );
        }

        return this.update(
          entityId,
          request
        );


      case 'DELETE':

        if (!entityId) {
          throw this.badRequest(
            'Silinecek kritik stok kuralı kimliği eksik.'
          );
        }

        return this.softDelete(
          entityId
        );


      default:
        throw new HttpErrorResponse({
          status: 405,

          statusText:
            'Method Not Allowed',

          error:
            this.runtime.error(
              'Bu kritik stok kuralı işlemi desteklenmiyor.',
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
      this.db.getAll<LowStockRule>(
        'lowStockRules'
      );


    const productId =
      request.params.get(
        'productId'
      );


    if (productId) {
      items =
        items.filter(
          item =>
            item.productId ===
              productId
        );
    }


    const warehouseId =
      request.params.get(
        'warehouseId'
      );


    if (warehouseId) {
      items =
        items.filter(
          item =>
            item.warehouseId ===
              warehouseId
        );
    }


    const isActive =
      request.params.get(
        'isActive'
      );


    if (isActive !== null) {

      const expected =
        isActive === 'true';


      items =
        items.filter(
          item =>
            item.isActive ===
              expected
        );
    }


    const sortBy =
      request.params.get(
        'sortBy'
      )
      ?? 'createdAt';


    const sortDirection =
      request.params.get(
        'sortDirection'
      )
      ?? 'desc';


    items =
      items
        .slice()
        .sort(
          (
            left,
            right
          ) => {

            const leftValue =
              (
                left as unknown as
                Record<string, unknown>
              )[sortBy];


            const rightValue =
              (
                right as unknown as
                Record<string, unknown>
              )[sortBy];


            const comparison =
              String(
                leftValue ?? ''
              )
                .localeCompare(
                  String(
                    rightValue ?? ''
                  ),
                  'tr-TR',
                  {
                    numeric: true
                  }
                );


            return sortDirection === 'asc'
              ? comparison
              : -comparison;
          }
        );


    const page =
      Math.max(
        1,
        Number(
          request.params.get(
            'page'
          )
          ?? 1
        )
      );


    const pageSize =
      Math.max(
        1,
        Number(
          request.params.get(
            'pageSize'
          )
          ?? 10
        )
      );


    const totalItems =
      items.length;


    const totalPages =
      totalItems === 0
        ? 0
        : Math.ceil(
            totalItems /
            pageSize
          );


    const startIndex =
      (page - 1) *
      pageSize;


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success({
          items:
            items.slice(
              startIndex,
              startIndex + pageSize
            ),

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
    id:
      string
  ): HttpResponse<unknown> {

    const rule =
      this.db.getById<LowStockRule>(
        'lowStockRules',
        id
      );


    if (!rule) {
      throw this.notFound(id);
    }


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          rule
        )
    });
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const payload =
      request.body as
        CreateLowStockRulePayload;


    this.validateCreatePayload(
      payload
    );


    this.requireActiveProduct(
      payload.productId
    );


    if (payload.warehouseId) {
      this.requireActiveWarehouse(
        payload.warehouseId
      );
    }


    this.ensureUniqueRule(
      payload.productId,
      payload.warehouseId
    );


    const now =
      new Date().toISOString();


    const rule:
      LowStockRule = {

        id:
          this.idGenerator.generate(),

        productId:
          payload.productId,

        warehouseId:
          payload.warehouseId
          || undefined,

        minQuantity:
          payload.minQuantity,

        isActive:
          true,

        createdAt:
          now,

        updatedAt:
          now
      };


    this.db.create<LowStockRule>(
      'lowStockRules',
      rule
    );


    this.auditLog.record({
      action:
        AuditActionType.CREATE,

      entityType:
        'LowStockRule',

      entityId:
        rule.id,

      description:
        'Kritik stok kuralı oluşturuldu.',

      newValue:
        rule
    });


    return new HttpResponse({
      status: 201,

      body:
        this.runtime.success(
          rule,
          'Kritik stok kuralı oluşturuldu.'
        )
    });
  }


  private update(
    id:
      string,

    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<LowStockRule>(
        'lowStockRules',
        id
      );


    if (!current) {
      throw this.notFound(id);
    }


    const payload =
      request.body as
        UpdateLowStockRulePayload;


    const nextWarehouseId =
      payload.warehouseId !== undefined
        ? (
            payload.warehouseId
            || undefined
          )
        : current.warehouseId;


    const nextMinQuantity =
      payload.minQuantity !== undefined
        ? payload.minQuantity
        : current.minQuantity;


    this.validateMinQuantity(
      nextMinQuantity
    );


    if (nextWarehouseId) {
      this.requireActiveWarehouse(
        nextWarehouseId
      );
    }


    this.ensureUniqueRule(
      current.productId,
      nextWarehouseId,
      id
    );


    const updated:
      LowStockRule = {

        ...current,

        warehouseId:
          nextWarehouseId,

        minQuantity:
          nextMinQuantity,

        isActive:
          payload.isActive
          ?? current.isActive,

        updatedAt:
          new Date().toISOString()
      };


    this.db.replace<LowStockRule>(
      'lowStockRules',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.UPDATE,

      entityType:
        'LowStockRule',

      entityId:
        id,

      description:
        'Kritik stok kuralı güncellendi.',

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
          'Kritik stok kuralı güncellendi.'
        )
    });
  }


  private softDelete(
    id:
      string
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<LowStockRule>(
        'lowStockRules',
        id
      );


    if (!current) {
      throw this.notFound(id);
    }


    if (!current.isActive) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Kritik stok kuralı zaten pasif durumda.',
            'LOW_STOCK_RULE_ALREADY_INACTIVE'
          )
      });
    }


    const updated:
      LowStockRule = {

        ...current,

        isActive:
          false,

        updatedAt:
          new Date().toISOString()
      };


    this.db.replace<LowStockRule>(
      'lowStockRules',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.DELETE,

      entityType:
        'LowStockRule',

      entityId:
        id,

      description:
        'Kritik stok kuralı pasife alındı.',

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
          'Kritik stok kuralı pasife alındı.'
        )
    });
  }


  private ensureUniqueRule(
    productId:
      string,

    warehouseId:
      string | undefined,

    currentRuleId?:
      string
  ): void {

    const duplicate =
      this.db.exists<LowStockRule>(
        'lowStockRules',
        rule =>
          rule.id !==
            currentRuleId
          &&
          rule.isActive
          &&
          rule.productId ===
            productId
          &&
          (
            rule.warehouseId
            ?? null
          )
          ===
          (
            warehouseId
            ?? null
          )
      );


    if (duplicate) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Bu ürün ve depo için aktif kritik stok kuralı zaten mevcut.',
            'LOW_STOCK_RULE_ALREADY_EXISTS'
          )
      });
    }
  }


  private validateCreatePayload(
    payload:
      CreateLowStockRulePayload
  ): void {

    if (!payload) {
      throw this.badRequest(
        'Kritik stok kuralı verisi zorunludur.'
      );
    }


    if (!payload.productId?.trim()) {
      throw this.badRequest(
        'Ürün zorunludur.'
      );
    }


    this.validateMinQuantity(
      payload.minQuantity
    );
  }


  private validateMinQuantity(
    minQuantity:
      number
  ): void {

    if (
      !Number.isFinite(
        minQuantity
      )
      ||
      minQuantity < 0
    ) {
      throw this.badRequest(
        'Minimum stok miktarı 0 veya daha büyük olmalıdır.'
      );
    }
  }


  private requireActiveProduct(
    id:
      string
  ): Product {

    const product =
      this.db.getById<Product>(
        'products',
        id
      );


    if (
      !product
      ||
      !product.isActive
    ) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Aktif ürün bulunamadı.',
            'ACTIVE_PRODUCT_REQUIRED'
          )
      });
    }


    return product;
  }


  private requireActiveWarehouse(
    id:
      string
  ): Warehouse {

    const warehouse =
      this.db.getById<Warehouse>(
        'warehouses',
        id
      );


    if (
      !warehouse
      ||
      !warehouse.isActive
    ) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Aktif depo bulunamadı.',
            'ACTIVE_WAREHOUSE_REQUIRED'
          )
      });
    }


    return warehouse;
  }


  private badRequest(
    message:
      string
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status: 400,

      statusText:
        'Bad Request',

      error:
        this.runtime.error(
          message,
          'BAD_REQUEST'
        )
    });
  }


  private notFound(
    id:
      string
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status: 404,

      statusText:
        'Not Found',

      error:
        this.runtime.error(
          'Kritik stok kuralı bulunamadı.',
          'LOW_STOCK_RULE_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
