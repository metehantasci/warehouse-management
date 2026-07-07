import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  AuditActionType
} from '../../models/audit-action-type.enum';

import {
  BarcodeRecord
} from '../../../features/products/models/barcode-record';

import {
  Product
} from '../../../features/products/models/product';

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

import {
  GenericMockCrudHandler
} from './generic-crud.mock-handler';


export class ProductsMockHandler {

  private readonly genericHandler:
    GenericMockCrudHandler<Product>;


  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly auditLog:
      AuditLogService,

    private readonly idGenerator:
      IdGeneratorService
  ) {
    this.genericHandler =
      new GenericMockCrudHandler<Product>(
        db,
        runtime,
        {
          collection: 'products',
          entityLabel: 'Ürün'
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
            'Güncellenecek ürün kimliği eksik.'
          );
        }

        return this.update(
          entityId,
          request
        );

      case 'DELETE':
        if (!entityId) {
          throw this.badRequest(
            'Silinecek ürün kimliği eksik.'
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

    const product =
      request.body as Product;


    if (!product?.id) {
      throw this.badRequest(
        'Ürün id alanı zorunludur.'
      );
    }


    if (!product.code?.trim()) {
      throw this.badRequest(
        'Ürün kodu zorunludur.'
      );
    }


    if (!product.name?.trim()) {
      throw this.badRequest(
        'Ürün adı zorunludur.'
      );
    }


    this.ensureUniqueProductCode(
      product.code
    );


    this.ensureUniqueActiveBarcode(
      product.barcode,
      null
    );


    const now =
      new Date().toISOString();


    const entity: Product = {
      ...product,

      code:
        product.code.trim(),

      name:
        product.name.trim(),

      barcode:
        this.normalizeBarcode(
          product.barcode
        ),

      isActive:
        product.isActive ?? true,

      createdAt:
        product.createdAt || now,

      updatedAt:
        now
    };


    this.db.transaction(() => {

      this.db.create<Product>(
        'products',
        entity
      );


      if (entity.barcode) {
        this.createBarcodeRecord(
          entity.id,
          entity.barcode,
          now
        );
      }
    });


    this.auditLog.record({
      action:
        AuditActionType.CREATE,

      entityType:
        'Product',

      entityId:
        entity.id,

      description:
        `Ürün oluşturuldu: ${entity.name}`,

      newValue:
        entity
    });


    return new HttpResponse({
      status: 201,

      body:
        this.runtime.success(
          entity,
          'Ürün oluşturuldu.'
        )
    });
  }


  private update(
    id: string,
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<Product>(
        'products',
        id
      );


    if (!current) {
      throw this.notFound(id);
    }


    const patch =
      request.body as Partial<Product>;


    const nextCode =
      patch.code !== undefined
        ? patch.code.trim()
        : current.code;


    const nextName =
      patch.name !== undefined
        ? patch.name.trim()
        : current.name;


    const nextBarcode =
      patch.barcode !== undefined
        ? this.normalizeBarcode(
            patch.barcode
          )
        : current.barcode;


    if (!nextCode) {
      throw this.badRequest(
        'Ürün kodu boş olamaz.'
      );
    }


    if (!nextName) {
      throw this.badRequest(
        'Ürün adı boş olamaz.'
      );
    }


    this.ensureUniqueProductCode(
      nextCode,
      id
    );


    this.ensureUniqueActiveBarcode(
      nextBarcode,
      id
    );


    const now =
      new Date().toISOString();


    const updated: Product = {
      ...current,
      ...patch,

      id:
        current.id,

      code:
        nextCode,

      name:
        nextName,

      barcode:
        nextBarcode,

      createdAt:
        current.createdAt,

      updatedAt:
        now
    };


    this.db.transaction(() => {

      this.db.replace<Product>(
        'products',
        id,
        updated
      );


      if (
        current.barcode !==
        updated.barcode
      ) {
        this.deactivateProductBarcodes(
          id,
          now
        );


        if (updated.barcode) {
          this.createBarcodeRecord(
            id,
            updated.barcode,
            now
          );
        }
      }
    });


    this.auditLog.record({
      action:
        AuditActionType.UPDATE,

      entityType:
        'Product',

      entityId:
        id,

      description:
        `Ürün güncellendi: ${updated.name}`,

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
          'Ürün güncellendi.'
        )
    });
  }


  private softDelete(
    id: string
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<Product>(
        'products',
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
            'Ürün zaten pasif durumda.',
            'PRODUCT_ALREADY_INACTIVE',
            {
              id
            }
          )
      });
    }


    const now =
      new Date().toISOString();


    const updated: Product = {
      ...current,
      isActive: false,
      updatedAt: now
    };


    this.db.transaction(() => {

      this.db.replace<Product>(
        'products',
        id,
        updated
      );


      this.deactivateProductBarcodes(
        id,
        now
      );
    });


    this.auditLog.record({
      action:
        AuditActionType.DELETE,

      entityType:
        'Product',

      entityId:
        id,

      description:
        `Ürün pasife alındı: ${current.name}`,

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
          'Ürün pasife alındı.'
        )
    });
  }


  private ensureUniqueProductCode(
    code: string,
    currentProductId?: string
  ): void {

    const normalizedCode =
      code
        .trim()
        .toLocaleLowerCase('tr-TR');


    const duplicate =
      this.db.exists<Product>(
        'products',
        product =>
          product.id !== currentProductId
          &&
          product.code
            .trim()
            .toLocaleLowerCase('tr-TR')
            === normalizedCode
      );


    if (duplicate) {
      throw new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',

        error:
          this.runtime.error(
            'Bu ürün kodu zaten kullanılıyor.',
            'PRODUCT_CODE_ALREADY_EXISTS',
            {
              code
            }
          )
      });
    }
  }


  private ensureUniqueActiveBarcode(
    barcode:
      string | null | undefined,

    currentProductId:
      string | null
  ): void {

    const normalizedBarcode =
      this.normalizeBarcode(
        barcode
      );


    if (!normalizedBarcode) {
      return;
    }


    const duplicate =
      this.db.exists<BarcodeRecord>(
        'barcodeRecords',
        record =>
          record.isActive
          &&
          record.productId !==
            currentProductId
          &&
          record.barcode ===
            normalizedBarcode
      );


    if (duplicate) {
      throw new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',

        error:
          this.runtime.error(
            'Bu barkod başka bir aktif ürüne atanmış.',
            'ACTIVE_BARCODE_ALREADY_ASSIGNED',
            {
              barcode:
                normalizedBarcode
            }
          )
      });
    }
  }


  private createBarcodeRecord(
    productId: string,
    barcode: string,
    timestamp: string
  ): void {

    const record:
      BarcodeRecord = {

        id:
          this.idGenerator.generate(),

        barcode,

        productId,

        assignedAt:
          timestamp,

        isActive:
          true,

        createdAt:
          timestamp,

        updatedAt:
          timestamp
      };


    this.db.create<BarcodeRecord>(
      'barcodeRecords',
      record
    );
  }


  private deactivateProductBarcodes(
    productId: string,
    timestamp: string
  ): void {

    const records =
      this.db.getAll<BarcodeRecord>(
        'barcodeRecords'
      );


    const nextRecords =
      records.map(record => {

        if (
          record.productId !== productId
          ||
          !record.isActive
        ) {
          return record;
        }


        return {
          ...record,
          isActive: false,
          updatedAt: timestamp
        };
      });


    this.db.setAll(
      'barcodeRecords',
      nextRecords
    );
  }


  private normalizeBarcode(
    barcode:
      string | null | undefined
  ): string | null {

    const normalized =
      barcode?.trim() ?? '';


    return normalized || null;
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
          'Ürün bulunamadı.',
          'PRODUCT_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
