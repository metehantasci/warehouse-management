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
  TransferStatus
} from '../../../../core/models/transfer-status.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

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
  TransferRequest
} from '../../models/transfer-request';

import {
  TransferDataService
} from '../../services/transfer-data';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './transfer-list.html',
  styleUrl: './transfer-list.scss'
})
export class TransferList implements OnInit {
  private readonly data =
    inject(TransferDataService);

  private readonly productData =
    inject(ProductDataService);

  private readonly warehouseData =
    inject(WarehouseDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly transfers =
    signal<TransferRequest[]>([]);

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

  readonly selectedStatus =
    signal('Tümü');

  readonly filtered =
    computed(() => {
      const q =
        this.search()
          .trim()
          .toLocaleLowerCase(
            'tr-TR'
          );

      const status =
        this.selectedStatus();

      return this.transfers()
        .filter(item => {
          const text = [
            this.productName(
              item.productId
            ),
            this.warehouseName(
              item.sourceWarehouseId
            ),
            this.warehouseName(
              item.destinationWarehouseId
            ),
            item.note ?? ''
          ]
            .join(' ')
            .toLocaleLowerCase(
              'tr-TR'
            );

          return (
            (
              !q
              ||
              text.includes(q)
            )
            &&
            (
              status === 'Tümü'
              ||
              item.status === status
            )
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
      transfers:
        this.data.getAll({
          page: 1,
          pageSize: 200,
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
          this.transfers.set(
            response.transfers
              .data.items
              .filter(
                item =>
                  item.isActive
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
            'Transferler yüklenemedi.'
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

  onStatus(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLSelectElement
    ) {
      this.selectedStatus.set(
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

  countStatus(
    status: string
  ): number {
    return this.transfers()
      .filter(
        item =>
          item.status === status
      )
      .length;
  }

  statusLabel(
    status: TransferStatus
  ): string {
    const labels:
      Record<
        TransferStatus,
        string
      > = {
        [TransferStatus.PENDING]:
          'Bekliyor',

        [TransferStatus.APPROVED]:
          'Onaylandı',

        [TransferStatus.CANCELLED]:
          'İptal'
      };

    return labels[status];
  }

  async approve(
    id: string
  ): Promise<void> {
    const confirmed =
      await this.confirmDialog.confirm({
        title:
          'Transferi Onayla',

        message:
          'Transfer onaylandığında hedef depoya giriş hareketi işlenecektir. Devam edilsin mi?',

        confirmText:
          'Onayla',

        cancelText:
          'Vazgeç',

        variant:
          'info'
      });

    if (!confirmed) {
      return;
    }

    this.data
      .approve(id)
      .subscribe({
        next:
          () => this.load(),

        error:
          error =>
            this.error.set(
              error?.error?.message
              ??
              'Transfer onaylanamadı.'
            )
      });
  }

  async cancel(
    id: string
  ): Promise<void> {
    const reason =
      await this.confirmDialog.prompt({
        title:
          'Transferi İptal Et',

        message:
          'İptal nedeni audit kaydına ve transfer geçmişine eklenecektir.',

        inputLabel:
          'İptal Nedeni',

        inputPlaceholder:
          'Örn: Talep geri çekildi',

        confirmText:
          'Transferi İptal Et',

        cancelText:
          'Vazgeç',

        variant:
          'danger',

        inputRequired:
          true
      });

    if (!reason) {
      return;
    }

    this.data
      .cancel(
        id,
        { reason }
      )
      .subscribe({
        next:
          () => this.load(),

        error:
          error =>
            this.error.set(
              error?.error?.message
              ??
              'Transfer iptal edilemedi.'
            )
      });
  }
}
