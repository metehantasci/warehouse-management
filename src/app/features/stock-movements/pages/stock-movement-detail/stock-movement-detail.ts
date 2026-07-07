import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  MovementType
} from '../../../../core/models/movement-type.enum';

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
  selector: 'app-stock-movement-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './stock-movement-detail.html',
  styleUrl: './stock-movement-detail.scss'
})
export class StockMovementDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(StockMovementDataService);
  private readonly productData = inject(ProductDataService);
  private readonly warehouseData = inject(WarehouseDataService);

  readonly movement = signal<StockMovement | null>(null);
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Hareket ID bulunamadı.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      movement: this.data.getById(id),
      products: this.productData.getAll({
        page: 1,
        pageSize: 300
      }),
      warehouses: this.warehouseData.getAll({
        page: 1,
        pageSize: 100
      })
    }).subscribe({
      next: response => {
        this.movement.set(response.movement.data);
        this.products.set(response.products.data.items);
        this.warehouses.set(response.warehouses.data.items);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error?.error?.message ?? 'Stok hareketi bulunamadı.');
        this.loading.set(false);
      }
    });
  }

  productName(id: string): string {
    return this.products().find(product => product.id === id)?.name ?? id;
  }

  warehouseName(id: string): string {
    return this.warehouses().find(warehouse => warehouse.id === id)?.name ?? id;
  }

  typeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.IN:
        return 'Stok Girişi';
      case MovementType.OUT:
        return 'Stok Çıkışı';
      case MovementType.ADJUSTMENT:
        return 'Stok Düzeltme';
      case MovementType.TRANSFER_IN:
        return 'Transfer Girişi';
      case MovementType.TRANSFER_OUT:
        return 'Transfer Çıkışı';
      default:
        return String(type);
    }
  }
}
