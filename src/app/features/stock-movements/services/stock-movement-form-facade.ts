import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  finalize,
  forkJoin,
  Observable
} from 'rxjs';

import {
  MovementType
} from '../../../core/models/movement-type.enum';

import {
  AuthService
} from '../../../core/services/auth';

import {
  Product
} from '../../products/models/product';

import {
  ProductDataService
} from '../../products/services/product-data';

import {
  Warehouse
} from '../../warehouses/models/warehouse';

import {
  WarehouseDataService
} from '../../warehouses/services/warehouse-data';

import {
  StockMovement
} from '../models/stock-movement';

import {
  StockMovementFacadeService
} from './stock-movement-facade';

export interface StockMovementFormValue {
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  targetBalance: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementFormFacadeService {
  private readonly productData =
    inject(ProductDataService);

  private readonly warehouseData =
    inject(WarehouseDataService);

  private readonly movementFacade =
    inject(StockMovementFacadeService);

  private readonly auth =
    inject(AuthService);

  private readonly productsState =
    signal<Product[]>([]);

  private readonly warehousesState =
    signal<Warehouse[]>([]);

  private readonly loadingState =
    signal(false);

  private readonly errorState =
    signal<string | null>(null);

  readonly products =
    computed(
      () =>
        this.productsState()
          .filter(
            item => item.isActive
          )
    );

  readonly warehouses =
    computed(
      () =>
        this.warehousesState()
          .filter(
            item => item.isActive
          )
    );

  readonly loading =
    this.loadingState.asReadonly();

  readonly error =
    this.errorState.asReadonly();

  loadOptions(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      products:
        this.productData.getAll({
          page: 1,
          pageSize: 300,
          sortBy: 'name',
          sortDirection: 'asc'
        }),

      warehouses:
        this.warehouseData.getAll({
          page: 1,
          pageSize: 100,
          sortBy: 'name',
          sortDirection: 'asc'
        })
    })
      .pipe(
        finalize(
          () =>
            this.loadingState.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.productsState.set(
            response.products.data.items
          );

          this.warehousesState.set(
            response.warehouses.data.items
          );
        },

        error: error => {
          this.errorState.set(
            error?.error?.message
            ?? 'Form seçenekleri yüklenemedi.'
          );
        }
      });
  }

  create(
    value: StockMovementFormValue
  ): Observable<StockMovement> {
    const user =
      this.auth.currentUser();

    if (!user) {
      throw new Error(
        'Aktif kullanıcı bulunamadı.'
      );
    }

    const actor = {
      userId: user.id,
      role: user.role
    };

    const baseRequest = {
      productId:
        value.productId,

      warehouseId:
        value.warehouseId,

      quantity:
        Number(value.quantity),

      reason:
        value.reason.trim(),

      actor
    };

    switch (value.type) {
      case MovementType.OUT:
        return this.movementFacade
          .stockOut(baseRequest);

      case MovementType.ADJUSTMENT:
        return this.movementFacade
          .adjustTo({
            productId:
              value.productId,

            warehouseId:
              value.warehouseId,

            targetBalance:
              Number(
                value.targetBalance
              ),

            reason:
              value.reason.trim(),

            actor
          });

      case MovementType.IN:
      default:
        return this.movementFacade
          .stockIn(baseRequest);
    }
  }
}
