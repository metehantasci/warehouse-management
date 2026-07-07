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
  Product
} from '../../../features/products/models/product';

import {
  Warehouse
} from '../../../features/warehouses/models/warehouse';

import {
  StockMovement
} from '../../../features/stock-movements/models/stock-movement';

import {
  CreateStockMovementPayload
} from '../../../features/stock-movements/services/stock-movement-domain';

import {
  StockBalanceQueryService
} from '../../../features/stock-movements/services/stock-balance-query';

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


export class StockMovementsMockHandler {

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
      StockBalanceQueryService
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
      request.method === 'GET'
      &&
      entityId === 'balances'
    ) {
      return this.getBalances();
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
              'Bu stok hareketi işlemi desteklenmiyor.',
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
      this.db.getAll<StockMovement>(
        'stockMovements'
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
          movement =>
            movement.id
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            movement.reason
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
        );
    }


    const productId =
      request.params.get(
        'productId'
      );


    if (productId) {
      items =
        items.filter(
          movement =>
            movement.productId ===
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
          movement =>
            movement.warehouseId ===
              warehouseId
        );
    }


    const type =
      request.params.get(
        'type'
      );


    if (type) {
      items =
        items.filter(
          movement =>
            movement.type ===
              type
        );
    }


    const isCancelled =
      request.params.get(
        'isCancelled'
      );


    if (
      isCancelled !== null
    ) {

      const expected =
        isCancelled === 'true';


      items =
        items.filter(
          movement =>
            movement.isCancelled ===
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


            return (
              sortDirection ===
                'asc'
            )
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
      ) * pageSize;


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

    const movement =
      this.db.getById<StockMovement>(
        'stockMovements',
        id
      );


    if (!movement) {
      throw this.notFound(
        id
      );
    }


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          movement
        )
    });
  }


  private getBalances():
    HttpResponse<unknown> {

    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const balances =
      this.balanceQuery
        .calculateBalances(
          movements
        );


    return new HttpResponse({
      status: 200,

      body:
        this.runtime.success(
          balances
        )
    });
  }


  private create(
    request:
      HttpRequest<unknown>
  ): HttpResponse<unknown> {

    const payload =
      request.body as
        CreateStockMovementPayload;


    this.validatePayload(
      payload
    );


    this.ensureActiveProduct(
      payload.productId
    );


    this.ensureActiveWarehouse(
      payload.warehouseId
    );


    const movements =
      this.db.getAll<StockMovement>(
        'stockMovements'
      );


    const previousBalance =
      this.balanceQuery
        .calculateBalance(
          movements,
          payload.productId,
          payload.warehouseId
        );


    const {
      quantity,
      newBalance
    } =
      this.calculateMovementResult(
        payload,
        previousBalance
      );


    const now =
      new Date().toISOString();


    const movement:
      StockMovement = {

        id:
          this.idGenerator.generate(),

        productId:
          payload.productId,

        warehouseId:
          payload.warehouseId,

        type:
          payload.type,

        quantity,

        previousBalance,

        newBalance,

        relatedTransferId:
          payload.relatedTransferId,

        relatedShipmentId:
          payload.relatedShipmentId,

        performedByUserId:
          payload.performedByUserId,

        performedByRole:
          payload.performedByRole,

        reason:
          payload.reason.trim(),

        createdAt:
          now,

        updatedAt:
          now,

        isCancelled:
          false
      };


    this.db.create<StockMovement>(
      'stockMovements',
      movement
    );


    this.writeMovementAudit(
      movement
    );


    return new HttpResponse({
      status: 201,

      body:
        this.runtime.success(
          movement,
          'Stok hareketi oluşturuldu.'
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
      this.db.getById<StockMovement>(
        'stockMovements',
        id
      );


    if (!current) {
      throw this.notFound(
        id
      );
    }


    if (current.isCancelled) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Stok hareketi zaten iptal edilmiş.',
            'MOVEMENT_ALREADY_CANCELLED'
          )
      });
    }


    if (
      current.relatedTransferId
      ||
      current.relatedShipmentId
    ) {
      throw new HttpErrorResponse({
        status: 409,

        statusText:
          'Conflict',

        error:
          this.runtime.error(
            'Transfer veya sevkiyat hareketleri kendi iş akışından iptal edilmelidir.',
            'WORKFLOW_MOVEMENT_CANNOT_BE_CANCELLED_DIRECTLY'
          )
      });
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


    const updated:
      StockMovement = {

        ...current,

        isCancelled:
          true,

        updatedAt:
          new Date().toISOString(),

        reason:
          `${current.reason} | İptal: ${reason}`
      };


    this.db.replace<StockMovement>(
      'stockMovements',
      id,
      updated
    );


    this.auditLog.record({
      action:
        AuditActionType.CANCEL,

      entityType:
        'StockMovement',

      entityId:
        id,

      description:
        `Stok hareketi iptal edildi: ${id}`,

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
          'Stok hareketi iptal edildi.'
        )
    });
  }


  private calculateMovementResult(
    payload:
      CreateStockMovementPayload,

    previousBalance:
      number
  ): {
    quantity: number;
    newBalance: number;
  } {

    switch (
      payload.type
    ) {

      case MovementType.IN:
      case MovementType.TRANSFER_IN: {

        const quantity =
          this.requirePositiveQuantity(
            payload.quantity
          );


        return {
          quantity,

          newBalance:
            previousBalance +
            quantity
        };
      }


      case MovementType.OUT:
      case MovementType.TRANSFER_OUT: {

        const quantity =
          this.requirePositiveQuantity(
            payload.quantity
          );


        if (
          quantity >
          previousBalance
        ) {
          throw new HttpErrorResponse({
            status: 409,

            statusText:
              'Conflict',

            error:
              this.runtime.error(
                'Stok çıkışı mevcut bakiyeyi aşamaz.',
                'INSUFFICIENT_STOCK',
                {
                  currentBalance:
                    previousBalance,

                  requestedQuantity:
                    quantity
                }
              )
          });
        }


        return {
          quantity,

          newBalance:
            previousBalance -
            quantity
        };
      }


      case MovementType.ADJUSTMENT: {

        const targetBalance =
          payload.targetBalance;


        if (
          targetBalance ===
            undefined
          ||
          !Number.isFinite(
            targetBalance
          )
          ||
          targetBalance < 0
        ) {
          throw this.badRequest(
            'Geçerli bir hedef bakiye zorunludur.'
          );
        }


        if (
          targetBalance ===
            previousBalance
        ) {
          throw new HttpErrorResponse({
            status: 409,

            statusText:
              'Conflict',

            error:
              this.runtime.error(
                'Düzeltme işlemi mevcut bakiyeyi değiştirmelidir.',
                'ADJUSTMENT_NO_CHANGE'
              )
          });
        }


        return {
          quantity:
            Math.abs(
              targetBalance -
              previousBalance
            ),

          newBalance:
            targetBalance
        };
      }


      default: {
        const exhaustiveCheck:
          never = payload.type;

        throw this.badRequest(
          `Desteklenmeyen hareket tipi: ${String(exhaustiveCheck)}`
        );
      }
    }
  }


  private writeMovementAudit(
    movement:
      StockMovement
  ): void {

    if (
      movement.relatedTransferId
      ||
      movement.relatedShipmentId
    ) {
      return;
    }


    let action:
      AuditActionType;


    switch (
      movement.type
    ) {

      case MovementType.IN:
        action =
          AuditActionType.STOCK_IN;
        break;


      case MovementType.OUT:
        action =
          AuditActionType.STOCK_OUT;
        break;


      case MovementType.ADJUSTMENT:
        action =
          AuditActionType.UPDATE;
        break;


      case MovementType.TRANSFER_IN:
      case MovementType.TRANSFER_OUT:
        return;


      default:
        return;
    }


    this.auditLog.record({
      action,

      entityType:
        'StockMovement',

      entityId:
        movement.id,

      description:
        this.getAuditDescription(
          movement
        ),

      newValue:
        movement
    });
  }


  private getAuditDescription(
    movement:
      StockMovement
  ): string {

    switch (
      movement.type
    ) {

      case MovementType.IN:
        return (
          `Stok girişi yapıldı: ${movement.quantity}`
        );


      case MovementType.OUT:
        return (
          `Stok çıkışı yapıldı: ${movement.quantity}`
        );


      case MovementType.ADJUSTMENT:
        return (
          `Stok bakiyesi düzeltildi: ${movement.previousBalance} → ${movement.newBalance}`
        );


      default:
        return 'Stok hareketi oluşturuldu.';
    }
  }


  private validatePayload(
    payload:
      CreateStockMovementPayload
  ): void {

    if (!payload) {
      throw this.badRequest(
        'Stok hareketi verisi zorunludur.'
      );
    }


    if (!payload.productId?.trim()) {
      throw this.badRequest(
        'Ürün zorunludur.'
      );
    }


    if (!payload.warehouseId?.trim()) {
      throw this.badRequest(
        'Depo zorunludur.'
      );
    }


    if (!payload.type) {
      throw this.badRequest(
        'Hareket tipi zorunludur.'
      );
    }


    if (!payload.reason?.trim()) {
      throw this.badRequest(
        'Hareket nedeni zorunludur.'
      );
    }


    if (
      !payload.performedByUserId
        ?.trim()
    ) {
      throw this.badRequest(
        'İşlem yapan kullanıcı zorunludur.'
      );
    }


    if (!payload.performedByRole) {
      throw this.badRequest(
        'İşlem yapan kullanıcı rolü zorunludur.'
      );
    }
  }


  private ensureActiveProduct(
    productId:
      string
  ): void {

    const product =
      this.db.getById<Product>(
        'products',
        productId
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
            'ACTIVE_PRODUCT_REQUIRED',
            {
              productId
            }
          )
      });
    }
  }


  private ensureActiveWarehouse(
    warehouseId:
      string
  ): void {

    const warehouse =
      this.db.getById<Warehouse>(
        'warehouses',
        warehouseId
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
            'ACTIVE_WAREHOUSE_REQUIRED',
            {
              warehouseId
            }
          )
      });
    }
  }


  private requirePositiveQuantity(
    quantity:
      number
  ): number {

    if (
      !Number.isFinite(
        quantity
      )
      ||
      quantity <= 0
    ) {
      throw this.badRequest(
        'Miktar 0 değerinden büyük olmalıdır.'
      );
    }


    return Math.abs(
      quantity
    );
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
          'Stok hareketi bulunamadı.',
          'STOCK_MOVEMENT_NOT_FOUND',
          {
            id
          }
        )
    });
  }
}
