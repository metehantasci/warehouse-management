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
  TransferStatus
} from '../../models/transfer-status.enum';

import {
  Product
} from '../../../features/products/models/product';

import {
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  StockBalanceQueryService
} from '../../../features/stock-movements/services/stock-balance-query';

import {
  CreateTransferRequestPayload
} from '../../../features/transfers/services/transfer-data';

import {
  TransferRequest
} from '../../../features/transfers/models/transfer-request';

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


export class TransfersMockHandler {

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
      action === 'approve'
    ) {
      return this.approve(
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
          status: 405,

          statusText:
            'Method Not Allowed',

          error:
            this.runtime.error(
              'Bu transfer işlemi desteklenmiyor.',
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
      this.db.getAll<TransferRequest>(
        'transferRequests'
      );


    const search =
      request.params
        .get('search')
        ?.trim()
        .toLocaleLowerCase('tr-TR');


    if (search) {
      items =
        items.filter(
          transfer =>
            transfer.id
              .toLocaleLowerCase('tr-TR')
              .includes(search)
            ||
            transfer.note
              ?.toLocaleLowerCase('tr-TR')
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
          transfer =>
            transfer.status === status
        );
    }


    const productId =
      request.params.get(
        'productId'
      );


    if (productId) {
      items =
        items.filter(
          transfer =>
            transfer.productId ===
              productId
        );
    }


    const sourceWarehouseId =
      request.params.get(
        'sourceWarehouseId'
      );


    if (sourceWarehouseId) {
      items =
        items.filter(
          transfer =>
            transfer.sourceWarehouseId ===
              sourceWarehouseId
        );
    }


    const destinationWarehouseId =
      request.params.get(
        'destinationWarehouseId'
      );


    if (destinationWarehouseId) {
      items =
        items.filter(
          transfer =>
            transfer.destinationWarehouseId ===
              destinationWarehouseId
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
      totalItems === 0
        ? 0
        : Math.ceil(
            totalItems /
            pageSize
          );


    const startIndex =
      (page - 1) *
      pageSize;


    const pagedItems =
      items.slice(
        startIndex,
        startIndex +
        pageSize
      );


    return new HttpResponse({
      status: 200,

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

    const transfer =
      this.db.getById<TransferRequest>(
        'transferRequests',
        id
      );


    if (!transfer) {
      throw this.notFound(
        id
      );
    }


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          transfer
        )
    });
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const payload =
      request.body as
        CreateTransferRequestPayload;


    this.validateCreatePayload(
      payload
    );


    const product =
      this.requireActiveProduct(
        payload.productId
      );


    const sourceWarehouse =
      this.requireActiveWarehouse(
        payload.sourceWarehouseId
      );


    const destinationWarehouse =
      this.requireActiveWarehouse(
        payload.destinationWarehouseId
      );


    if (
      sourceWarehouse.id ===
      destinationWarehouse.id
    ) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Kaynak ve hedef depo aynı olamaz.',
            'SOURCE_EQUALS_DESTINATION'
          )
      });
    }


    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const sourceBalance =
      this.balanceQuery
        .calculateBalance(
          movements,
          product.id,
          sourceWarehouse.id
        );


    if (
      payload.quantity >
      sourceBalance
    ) {
      throw this.insufficientStock(
        sourceBalance,
        payload.quantity
      );
    }


    const user =
      this.requireCurrentUser();


    const now =
      new Date().toISOString();


    const transferId =
      this.idGenerator.generate();


    const transfer:
      TransferRequest = {

        id:
          transferId,

        productId:
          product.id,

        sourceWarehouseId:
          sourceWarehouse.id,

        destinationWarehouseId:
          destinationWarehouse.id,

        quantity:
          payload.quantity,

        status:
          TransferStatus.PENDING,

        requestedByUserId:
          user.id,

        requestedAt:
          now,

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


    const transferOut:
      StockMovement = {

        id:
          this.idGenerator.generate(),

        productId:
          product.id,

        warehouseId:
          sourceWarehouse.id,

        type:
          MovementType.TRANSFER_OUT,

        quantity:
          payload.quantity,

        previousBalance:
          sourceBalance,

        newBalance:
          sourceBalance -
          payload.quantity,

        relatedTransferId:
          transferId,

        performedByUserId:
          user.id,

        performedByRole:
          user.role,

        reason:
          `Transfer talebi oluşturuldu: ${sourceWarehouse.name} → ${destinationWarehouse.name}`,

        createdAt:
          now,

        updatedAt:
          now,

        isCancelled:
          false
      };


    this.db.transaction(() => {

      this.db.create<TransferRequest>(
        'transferRequests',
        transfer
      );


      this.db.create<StockMovement>(
        'stockMovements',
        transferOut
      );
    });


    this.auditLog.record({
      action:
        AuditActionType.TRANSFER,

      entityType:
        'TransferRequest',

      entityId:
        transfer.id,

      description:
        `Transfer talebi oluşturuldu: ${product.name}, ${sourceWarehouse.name} → ${destinationWarehouse.name}`,

      newValue:
        transfer
    });


    return new HttpResponse({
      status: 201,

      body:
        this.runtime.success(
          transfer,
          'Transfer talebi oluşturuldu.'
        )
    });
  }


  private approve(
    id:
      string
  ): HttpResponse<unknown> {

    const current =
      this.db.getById<TransferRequest>(
        'transferRequests',
        id
      );


    if (!current) {
      throw this.notFound(
        id
      );
    }


    if (
      current.status !==
      TransferStatus.PENDING
    ) {
      throw this.invalidStatus(
        'Sadece bekleyen transferler onaylanabilir.'
      );
    }


    const user =
      this.requireCurrentUser();


    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const destinationBalance =
      this.balanceQuery
        .calculateBalance(
          movements,
          current.productId,
          current.destinationWarehouseId
        );


    const now =
      new Date().toISOString();


    const transferIn:
      StockMovement = {

        id:
          this.idGenerator.generate(),

        productId:
          current.productId,

        warehouseId:
          current.destinationWarehouseId,

        type:
          MovementType.TRANSFER_IN,

        quantity:
          current.quantity,

        previousBalance:
          destinationBalance,

        newBalance:
          destinationBalance +
          current.quantity,

        relatedTransferId:
          current.id,

        performedByUserId:
          user.id,

        performedByRole:
          user.role,

        reason:
          'Transfer onaylandı, hedef depo stok girişi.',

        createdAt:
          now,

        updatedAt:
          now,

        isCancelled:
          false
      };


    const updated:
      TransferRequest = {

        ...current,

        status:
          TransferStatus.APPROVED,

        approvedByUserId:
          user.id,

        decidedAt:
          now,

        updatedAt:
          now
      };


    this.db.transaction(() => {

      this.db.replace<TransferRequest>(
        'transferRequests',
        id,
        updated
      );


      this.db.create<StockMovement>(
        'stockMovements',
        transferIn
      );
    });


    this.auditLog.record({
      action:
        AuditActionType.APPROVE,

      entityType:
        'TransferRequest',

      entityId:
        id,

      description:
        'Transfer talebi onaylandı.',

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
          'Transfer onaylandı.'
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
      this.db.getById<TransferRequest>(
        'transferRequests',
        id
      );


    if (!current) {
      throw this.notFound(
        id
      );
    }


    if (
      current.status !==
      TransferStatus.PENDING
    ) {
      throw this.invalidStatus(
        'Sadece bekleyen transferler iptal edilebilir.'
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


    const user =
      this.requireCurrentUser();


    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const sourceBalance =
      this.balanceQuery
        .calculateBalance(
          movements,
          current.productId,
          current.sourceWarehouseId
        );


    const now =
      new Date().toISOString();


    const restoreMovement:
      StockMovement = {

        id:
          this.idGenerator.generate(),

        productId:
          current.productId,

        warehouseId:
          current.sourceWarehouseId,

        type:
          MovementType.TRANSFER_IN,

        quantity:
          current.quantity,

        previousBalance:
          sourceBalance,

        newBalance:
          sourceBalance +
          current.quantity,

        relatedTransferId:
          current.id,

        performedByUserId:
          user.id,

        performedByRole:
          user.role,

        reason:
          `İptal edilen transfer için kaynak stok geri yüklendi: ${reason}`,

        createdAt:
          now,

        updatedAt:
          now,

        isCancelled:
          false
      };


    const updated:
      TransferRequest = {

        ...current,

        status:
          TransferStatus.CANCELLED,

        decidedAt:
          now,

        cancellationReason:
          reason,

        updatedAt:
          now
      };


    this.db.transaction(() => {

      this.db.replace<TransferRequest>(
        'transferRequests',
        id,
        updated
      );


      this.db.create<StockMovement>(
        'stockMovements',
        restoreMovement
      );
    });


    this.auditLog.record({
      action:
        AuditActionType.CANCEL,

      entityType:
        'TransferRequest',

      entityId:
        id,

      description:
        'Transfer talebi iptal edildi ve kaynak stok geri yüklendi.',

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
          'Transfer iptal edildi.'
        )
    });
  }


  private validateCreatePayload(
    payload:
      CreateTransferRequestPayload
  ): void {

    if (!payload) {
      throw this.badRequest(
        'Transfer verisi zorunludur.'
      );
    }


    if (!payload.productId?.trim()) {
      throw this.badRequest(
        'Ürün zorunludur.'
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
      !payload.destinationWarehouseId
        ?.trim()
    ) {
      throw this.badRequest(
        'Hedef depo zorunludur.'
      );
    }


    if (
      !Number.isFinite(
        payload.quantity
      )
      ||
      payload.quantity <= 0
    ) {
      throw this.badRequest(
        'Transfer miktarı 0 değerinden büyük olmalıdır.'
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


  private requireCurrentUser() {

    const user =
      this.authService.currentUser();


    if (!user) {
      throw new HttpErrorResponse({
        status: 401,

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


  private insufficientStock(
    currentBalance:
      number,

    requestedQuantity:
      number
  ): HttpErrorResponse {

    return new HttpErrorResponse({
      status: 409,

      statusText:
        'Conflict',

      error:
        this.runtime.error(
          'Transfer miktarı kaynak depodaki mevcut stoğu aşamaz.',
          'INSUFFICIENT_SOURCE_STOCK',
          {
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
      status: 409,

      statusText:
        'Conflict',

      error:
        this.runtime.error(
          message,
          'INVALID_TRANSFER_STATUS'
        )
    });
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
          'Transfer bulunamadı.',
          'TRANSFER_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
