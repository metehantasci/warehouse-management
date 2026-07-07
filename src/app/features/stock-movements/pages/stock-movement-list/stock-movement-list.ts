import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  MovementType
} from '../../../../core/models/movement-type.enum';

import {
  PermissionDirective
} from '../../../../shared/directives/permission';

import {
  Product
} from '../../../products/models/product';

import {
  ProductDataService
} from '../../../products/services/product-data';

import {
  Warehouse
} from '../../../warehouses/models/warehouse';

import {
  WarehouseDataService
} from '../../../warehouses/services/warehouse-data';

import {
  StockMovement
} from '../../models/stock-movement';

import {
  StockMovementDataService
} from '../../services/stock-movement-data';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './stock-movement-list.html',
  styleUrl: './stock-movement-list.scss'
})
export class StockMovementList implements OnInit {
  private readonly data =
    inject(StockMovementDataService);

  private readonly productData =
    inject(ProductDataService);

  private readonly warehouseData =
    inject(WarehouseDataService);

  readonly movements =
    signal<StockMovement[]>([]);

  readonly products =
    signal<Product[]>([]);

  readonly warehouses =
    signal<Warehouse[]>([]);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly search =
    signal('');

  readonly selectedType =
    signal('Tümü');

  readonly filtered =
    computed(() => {
      const q =
        this.search()
          .trim()
          .toLocaleLowerCase(
            'tr-TR'
          );

      const type =
        this.selectedType();

      return this.movements()
        .filter(item => {
          const productName =
            this.productName(
              item.productId
            )
              .toLocaleLowerCase(
                'tr-TR'
              );

          const warehouseName =
            this.warehouseName(
              item.warehouseId
            )
              .toLocaleLowerCase(
                'tr-TR'
              );

          const matchesSearch =
            !q
            ||
            productName.includes(q)
            ||
            warehouseName.includes(q)
            ||
            item.reason
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q);

          const matchesType =
            type === 'Tümü'
            ||
            item.type === type;

          return (
            matchesSearch
            &&
            matchesType
          );
        });
    });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      movements:
        this.data.getAll({
          page: 1,
          pageSize: 300,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        }),

      products:
        this.productData.getAll({
          page: 1,
          pageSize: 300
        }),

      warehouses:
        this.warehouseData.getAll({
          page: 1,
          pageSize: 100
        })
    })
      .subscribe({
        next: response => {
          this.movements.set(
            response.movements
              .data.items
              .filter(
                item =>
                  !item.isCancelled
              )
          );

          this.products.set(
            response.products
              .data.items
          );

          this.warehouses.set(
            response.warehouses
              .data.items
          );

          this.loading.set(false);
        },

        error: error => {
          this.error.set(
            error?.error?.message
            ??
            'Stok hareketleri yüklenemedi.'
          );

          this.loading.set(false);
        }
      });
  }

  onSearch(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLInputElement
    ) {
      this.search.set(
        target.value
      );
    }
  }

  onType(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLSelectElement
    ) {
      this.selectedType.set(
        target.value
      );
    }
  }

  productName(
    id: string
  ): string {
    return (
      this.products()
        .find(
          item =>
            item.id === id
        )
        ?.name
      ?? id
    );
  }

  warehouseName(
    id: string
  ): string {
    return (
      this.warehouses()
        .find(
          item =>
            item.id === id
        )
        ?.name
      ?? id
    );
  }

  typeLabel(
    type: MovementType
  ): string {
    const labels:
      Record<
        MovementType,
        string
      > = {
        [MovementType.IN]:
          'Giriş',

        [MovementType.OUT]:
          'Çıkış',

        [MovementType.ADJUSTMENT]:
          'Düzeltme',

        [MovementType.TRANSFER_IN]:
          'Transfer Giriş',

        [MovementType.TRANSFER_OUT]:
          'Transfer Çıkış'
      };

    return labels[type];
  }

  countType(
    type: string
  ): number {
    return this.movements()
      .filter(
        item =>
          item.type === type
      )
      .length;
  }

  typeClass(
    type: MovementType
  ): string {
    return (
      type === MovementType.IN
      ||
      type ===
        MovementType.TRANSFER_IN
    )
      ? 'green'
      : (
          type === MovementType.OUT
          ||
          type ===
            MovementType.TRANSFER_OUT
        )
        ? 'orange'
        : '';
  }
}
