import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  AuditActionType
} from '../../models/audit-action-type.enum';

import {
  MovementType
} from '../../models/movement-type.enum';

import {
  ShipmentStatus
} from '../../models/shipment-status.enum';

import {
  Product
} from '../../../features/products/models/product';

import {
  Shipment
} from '../../../features/shipments/models/shipment';

import {
  ShipmentItem
} from '../../../features/shipments/models/shipment-item';

import {
  CreateShipmentPayload
} from '../../../features/shipments/services/shipment-data';

import {
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../../features/stock-movements/services/stock-balance-query';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  AuditLogService
} from '../../services/audit-log';

import {
  AuthService
} from '../../services/auth';

import {
  IdGeneratorService
} from '../../services/id-generator';

import {
  MockApiRuntimeService
} from '../../services/mock-api-runtime';

import {
  MockDbService
} from '../../services/mock-db';


export class ShipmentsMockHandler {

  constructor(
    private readonly db:
      MockDbService,

    private readonly runtime:
      MockApiRuntimeService,

    private readonly auditLog:
      AuditLogService,

    private readonly idGenerator:
      IdGeneratorService,

    private readonly balanceQuery:
      StockBalanceQueryService,

    private readonly authService:
      AuthService
  ) {}


  handle(
    request:
      HttpRequest<unknown>,

    entityId:
      string | null,

    action:
      string | null
  ): HttpResponse<unknown> {

    if (
      request.method === 'PATCH'
      &&
      entityId
      &&
      action === 'confirm'
    ) {

      return this.confirm(
        entityId
      );
    }


    if (
      request.method === 'PATCH'
      &&
      entityId
      &&
      action === 'ship'
    ) {

      return this.ship(
        entityId
      );
    }


    if (
      request.method === 'PATCH'
      &&
      entityId
      &&
      action === 'deliver'
    ) {

      return this.deliver(
        entityId
      );
    }


    if (
      request.method === 'PATCH'
      &&
      entityId
      &&
      action === 'cancel'
    ) {

      return this.cancel(
        entityId,
        request
      );
    }


    switch (
      request.method
    ) {

      case 'GET':

        return entityId
          ? this.getById(
              entityId
            )
          : this.getAll(
              request
            );


      case 'POST':

        return this.create(
          request
        );


      default:

        throw new HttpErrorResponse({
          status:
            405,

          statusText:
            'Method Not Allowed',

          error:
            this.runtime.error(
              'Bu sevkiyat işlemi desteklenmiyor.',
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
      this.db.getAll<Shipment>(
        'shipments'
      );


    const search =
      request.params
        .get('search')
        ?.trim()
        .toLocaleLowerCase(
          'tr-TR'
        );


    if (search) {

      items =
        items.filter(
          shipment =>
            shipment.code
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            shipment.destinationName
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            shipment.destinationAddress
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
        );
    }


    const status =
      request.params.get(
        'status'
      );


    if (status) {

      items =
        items.filter(
          shipment =>
            shipment.status ===
              status
        );
    }


    const sourceWarehouseId =
      request.params.get(
        'sourceWarehouseId'
      );


    if (sourceWarehouseId) {

      items =
        items.filter(
          shipment =>
            shipment.sourceWarehouseId ===
              sourceWarehouseId
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
                    numeric:
                      true
                  }
                );


            return sortDirection ===
              'asc'
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
      (
        page - 1
      )
      * pageSize;


    const pagedItems =
      items.slice(
        startIndex,
        startIndex +
        pageSize
      );


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success({
          items:
            pagedItems,

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

    const shipment =
      this.db.getById<Shipment>(
        'shipments',
        id
      );


    if (!shipment) {

      throw this.notFound(
        id
      );
    }


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success(
          shipment
        )
    });
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const payload =
      request.body as
        CreateShipmentPayload;


    this.validateCreatePayload(
      payload
    );


    const warehouse =
      this.requireActiveWarehouse(
        payload.sourceWarehouseId
      );


    const normalizedItems =
      this.normalizeItems(
        payload.items
      );


    this.ensureProductsActive(
      normalizedItems
    );


    this.ensureSufficientStock(
      warehouse.id,
      normalizedItems
    );


    const user =
      this.requireCurrentUser();


    const now =
      new Date().toISOString();


    const shipmentId =
      this.idGenerator.generate();


    const items:
      ShipmentItem[] =

      normalizedItems.map(
        item => ({
          id:
            this.idGenerator.generate(),

          shipmentId,

          productId:
            item.productId,

          quantity:
            item.quantity
        })
      );


    const shipment:
      Shipment = {

        id:
          shipmentId,

        code:
          this.createShipmentCode(),

        sourceWarehouseId:
          warehouse.id,

        destinationName:
          payload.destinationName.trim(),

        destinationAddress:
          payload.destinationAddress.trim(),

        plannedDate:
          new Date(
            payload.plannedDate
          ).toISOString(),

        status:
          ShipmentStatus.PLANNED,

        items,

        note:
          payload.note?.trim()
          || undefined,

        isActive:
          true,

        createdAt:
          now,

        updatedAt:
          now
      };


    this.db.create<Shipment>(
      'shipments',
      shipment
    );


    this.auditLog.record({
      action:
        AuditActionType.SHIPMENT,

      entityType:
        'Shipment',

      entityId:
        shipment.id,

      description:
        `Sevkiyat planlandı: ${shipment.code}`,

      newValue:
        shipment
    });


    return new HttpResponse({
      status:
        201,

      body:
        this.runtime.success(
          shipment,
          'Sevkiyat planlandı.'
        )
    });
  }


  private confirm(
    id:
      string
  ): HttpResponse<unknown> {

    const current =
      this.requireShipment(
        id
      );


    if (
      current.status !==
      ShipmentStatus.PLANNED
    ) {

      throw this.invalidStatus(
        'Sadece planlanan sevkiyatlar onaylanabilir.'
      );
    }


    this.ensureSufficientStock(
      current.sourceWarehouseId,
      current.items
    );


    const now =
      new Date().toISOString();


    const updated:
      Shipment = {

        ...current,

        status:
          ShipmentStatus.CONFIRMED,

        confirmedAt:
          now,

        updatedAt:
          now
      };


    this.db.replace<Shipment>(
      'shipments',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.STATUS_CHANGE,

      entityType:
        'Shipment',

      entityId:
        id,

      description:
        `Sevkiyat onaylandı: ${updated.code}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success(
          updated,
          'Sevkiyat onaylandı.'
        )
    });
  }


  private ship(
    id:
      string
  ): HttpResponse<unknown> {

    const current =
      this.requireShipment(
        id
      );


    if (
      current.status !==
      ShipmentStatus.CONFIRMED
    ) {

      throw this.invalidStatus(
        'Sadece onaylanan sevkiyatlar gönderilebilir.'
      );
    }


    this.ensureSufficientStock(
      current.sourceWarehouseId,
      current.items
    );


    const user =
      this.requireCurrentUser();


    const now =
      new Date().toISOString();


    const sourceMovements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const workingMovements = [
      ...sourceMovements
    ];


    const outgoingMovements:
      StockMovement[] = [];


    for (
      const item
      of current.items
    ) {

      const previousBalance =
        this.balanceQuery
          .calculateBalance(
            workingMovements,
            item.productId,
            current.sourceWarehouseId
          );


      if (
        item.quantity >
        previousBalance
      ) {

        throw this.insufficientStock(
          item.productId,
          previousBalance,
          item.quantity
        );
      }


      const movement:
        StockMovement = {

        id:
          this.idGenerator.generate(),

        productId:
          item.productId,

        warehouseId:
          current.sourceWarehouseId,

        type:
          MovementType.OUT,

        quantity:
          item.quantity,

        previousBalance,

        newBalance:
          previousBalance -
          item.quantity,

        relatedShipmentId:
          current.id,

        performedByUserId:
          user.id,

        performedByRole:
          user.role,

        reason:
          `Sevkiyat çıkışı: ${current.code}`,

        createdAt:
          now,

        updatedAt:
          now,

        isCancelled:
          false
      };


      outgoingMovements.push(
        movement
      );


      workingMovements.push(
        movement
      );
    }


    const updated:
      Shipment = {

        ...current,

        status:
          ShipmentStatus.SHIPPED,

        shippedAt:
          now,

        updatedAt:
          now
      };


    this.db.transaction(
      () => {

        this.db.replace<Shipment>(
          'shipments',
          id,
          updated
        );


        for (
          const movement
          of outgoingMovements
        ) {

          this.db.create<StockMovement>(
            'stockMovements',
            movement
          );
        }
      }
    );


    this.auditLog.record({
      action:
        AuditActionType.SHIPMENT,

      entityType:
        'Shipment',

      entityId:
        id,

      description:
        `Sevkiyat gönderildi ve stok çıkışları işlendi: ${updated.code}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success(
          updated,
          'Sevkiyat gönderildi.'
        )
    });
  }


  private deliver(
    id:
      string
  ): HttpResponse<unknown> {

    const current =
      this.requireShipment(
        id
      );


    if (
      current.status !==
      ShipmentStatus.SHIPPED
    ) {

      throw this.invalidStatus(
        'Sadece gönderilen sevkiyatlar teslim edilebilir.'
      );
    }


    const now =
      new Date().toISOString();


    const updated:
      Shipment = {

        ...current,

        status:
          ShipmentStatus.DELIVERED,

        deliveredAt:
          now,

        updatedAt:
          now
      };


    this.db.replace<Shipment>(
      'shipments',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.STATUS_CHANGE,

      entityType:
        'Shipment',

      entityId:
        id,

      description:
        `Sevkiyat teslim edildi: ${updated.code}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success(
          updated,
          'Sevkiyat teslim edildi.'
        )
    });
  }


  private cancel(
    id:
      string,

    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const current =
      this.requireShipment(
        id
      );


    if (
      current.status !==
        ShipmentStatus.PLANNED
      &&
      current.status !==
        ShipmentStatus.CONFIRMED
    ) {

      throw this.invalidStatus(
        'Sadece planlanan veya onaylanan sevkiyatlar iptal edilebilir.'
      );
    }


    const body =
      request.body as {
        reason?: string;
      };


    const reason =
      body?.reason?.trim();


    if (!reason) {

      throw this.badRequest(
        'İptal nedeni zorunludur.'
      );
    }


    const now =
      new Date().toISOString();


    const updated:
      Shipment = {

        ...current,

        status:
          ShipmentStatus.CANCELLED,

        cancelledAt:
          now,

        cancellationReason:
          reason,

        updatedAt:
          now
      };


    this.db.replace<Shipment>(
      'shipments',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.CANCEL,

      entityType:
        'Shipment',

      entityId:
        id,

      description:
        `Sevkiyat iptal edildi: ${updated.code}`,

      oldValue:
        current,

      newValue:
        updated
    });


    return new HttpResponse({
      status:
        200,

      body:
        this.runtime.success(
          updated,
          'Sevkiyat iptal edildi.'
        )
    });
  }


  private ensureSufficientStock(
    warehouseId:
      string,

    items:
      readonly {
        productId: string;
        quantity: number;
      }[]
  ): void {

    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    for (
      const item
      of items
    ) {

      const currentBalance =
        this.balanceQuery
          .calculateBalance(
            movements,
            item.productId,
            warehouseId
          );


      if (
        item.quantity >
        currentBalance
      ) {

        throw this.insufficientStock(
          item.productId,
          currentBalance,
          item.quantity
        );
      }
    }
  }


  private normalizeItems(
    items:
      readonly {
        productId: string;
        quantity: number;
      }[]
  ): {
    productId: string;
    quantity: number;
  }[] {

    const grouped =
      new Map<string, number>();


    for (
      const item
      of items
    ) {

      if (!item.productId?.trim()) {

        throw this.badRequest(
          'Sevkiyat kaleminde ürün zorunludur.'
        );
      }


      if (
        !Number.isFinite(
          item.quantity
        )
        ||
        item.quantity <= 0
      ) {

        throw this.badRequest(
          'Sevkiyat miktarı 0 değerinden büyük olmalıdır.'
        );
      }


      const current =
        grouped.get(
          item.productId
        )
        ?? 0;


      grouped.set(
        item.productId,
        current +
        item.quantity
      );
    }


    return [
      ...grouped.entries()
    ].map(
      (
        [
          productId,
          quantity
        ]
      ) => ({
        productId,
        quantity
      })
    );
  }


  private ensureProductsActive(
    items:
      readonly {
        productId: string;
      }[]
  ): void {

    for (
      const item
      of items
    ) {

      const product =
        this.db.getById<Product>(
          'products',
          item.productId
        );


      if (
        !product
        ||
        !product.isActive
      ) {

        throw new HttpErrorResponse({
          status:
            409,

          statusText:
            'Conflict',

          error:
            this.runtime.error(
              'Sevkiyat için aktif ürün gereklidir.',
              'ACTIVE_PRODUCT_REQUIRED',
              {
                productId:
                  item.productId
              }
            )
        });
      }
    }
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
        status:
          409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Sevkiyat için aktif kaynak depo gereklidir.',
            'ACTIVE_WAREHOUSE_REQUIRED'
          )
      });
    }


    return warehouse;
  }


  private requireShipment(
    id:
      string
  ): Shipment {

    const shipment =
      this.db.getById<Shipment>(
        'shipments',
        id
      );


    if (!shipment) {

      throw this.notFound(
        id
      );
    }


    return shipment;
  }


  private requireCurrentUser() {

    const user =
      this.authService.currentUser();


    if (!user) {

      throw new HttpErrorResponse({
        status:
          401,

        statusText:
          'Unauthorized',

        error:
          this.runtime.error(
            'Bu işlem için oturum açılmalıdır.',
            'AUTH_REQUIRED'
          )
      });
    }


    return user;
  }


  private validateCreatePayload(
    payload:
      CreateShipmentPayload
  ): void {

    if (!payload) {

      throw this.badRequest(
        'Sevkiyat verisi zorunludur.'
      );
    }


    if (
      !payload.sourceWarehouseId
        ?.trim()
    ) {

      throw this.badRequest(
        'Kaynak depo zorunludur.'
      );
    }


    if (
      !payload.destinationName
        ?.trim()
    ) {

      throw this.badRequest(
        'Teslimat noktası zorunludur.'
      );
    }


    if (
      !payload.destinationAddress
        ?.trim()
    ) {

      throw this.badRequest(
        'Teslimat adresi zorunludur.'
      );
    }


    if (
      !payload.plannedDate
      ||
      Number.isNaN(
        new Date(
          payload.plannedDate
        ).getTime()
      )
    ) {

      throw this.badRequest(
        'Geçerli planlanan tarih zorunludur.'
      );
    }


    if (
      !Array.isArray(
        payload.items
      )
      ||
      payload.items.length === 0
    ) {

      throw this.badRequest(
        'Sevkiyatta en az bir ürün bulunmalıdır.'
      );
    }
  }


  private createShipmentCode():
    string {

    const date =
      new Date();


    const year =
      date.getFullYear();


    const suffix =
      `${Date.now()}`
        .slice(-6);


    return (
      `SVK-${year}-${suffix}`
    );
  }


  private insufficientStock(
    productId:
      string,

    currentBalance:
      number,

    requestedQuantity:
      number
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status:
        409,

      statusText:
        'Conflict',

      error:
        this.runtime.error(
          'Sevkiyat için yeterli stok bulunmuyor.',
          'SHIPMENT_INSUFFICIENT_STOCK',
          {
            productId,
            currentBalance,
            requestedQuantity
          }
        )
    });
  }


  private invalidStatus(
    message:
      string
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status:
        409,

      statusText:
        'Conflict',

      error:
        this.runtime.error(
          message,
          'INVALID_SHIPMENT_STATUS'
        )
    });
  }


  private badRequest(
    message:
      string
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status:
        400,

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
      status:
        404,

      statusText:
        'Not Found',

      error:
        this.runtime.error(
          'Sevkiyat bulunamadı.',
          'SHIPMENT_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
