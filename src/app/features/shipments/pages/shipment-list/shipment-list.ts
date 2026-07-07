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
  ShipmentStatus
} from '../../../../core/models/shipment-status.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  PermissionDirective
} from '../../../../shared/directives/permission';

import {
  Warehouse
} from '../../../warehouses/models/warehouse';

import {
  WarehouseDataService
} from '../../../warehouses/services/warehouse-data';

import {
  Shipment
} from '../../models/shipment';

import {
  ShipmentDataService
} from '../../services/shipment-data';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './shipment-list.html',
  styleUrl: './shipment-list.scss'
})
export class ShipmentList implements OnInit {
  private readonly data =
    inject(ShipmentDataService);

  private readonly warehouseData =
    inject(WarehouseDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly shipments =
    signal<Shipment[]>([]);

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

      return this.shipments()
        .filter(item => {
          const text = [
            item.code,
            item.destinationName,
            item.destinationAddress,
            this.warehouseName(
              item.sourceWarehouseId
            )
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
      shipments:
        this.data.getAll({
          page: 1,
          pageSize: 200,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        }),

      warehouses:
        this.warehouseData.getAll({
          page: 1,
          pageSize: 100
        })
    })
      .subscribe({
        next: response => {
          this.shipments.set(
            response.shipments
              .data.items
              .filter(
                item =>
                  item.isActive
              )
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
            'Sevkiyatlar yüklenemedi.'
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
    return this.shipments()
      .filter(
        item =>
          item.status === status
      )
      .length;
  }

  statusLabel(
    status: ShipmentStatus
  ): string {
    const labels:
      Record<
        ShipmentStatus,
        string
      > = {
        [ShipmentStatus.PLANNED]:
          'Planlandı',

        [ShipmentStatus.CONFIRMED]:
          'Onaylandı',

        [ShipmentStatus.SHIPPED]:
          'Yola Çıktı',

        [ShipmentStatus.DELIVERED]:
          'Teslim Edildi',

        [ShipmentStatus.CANCELLED]:
          'İptal'
      };

    return labels[status];
  }

  async runAction(
    id: string,
    action:
      | 'confirm'
      | 'ship'
      | 'deliver'
  ): Promise<void> {
    const labels = {
      confirm: {
        title:
          'Sevkiyatı Onayla',

        message:
          'Sevkiyat onaylanacak ve operasyon akışına alınacaktır.',

        button:
          'Onayla'
      },

      ship: {
        title:
          'Sevkiyatı Yola Çıkar',

        message:
          'Sevkiyat yola çıktı durumuna alınacak ve stok hareketleri işlenecektir.',

        button:
          'Yola Çıkar'
      },

      deliver: {
        title:
          'Teslimatı Tamamla',

        message:
          'Sevkiyat teslim edildi olarak işaretlenecektir.',

        button:
          'Teslim Et'
      }
    } as const;

    const config =
      labels[action];

    const confirmed =
      await this.confirmDialog.confirm({
        title:
          config.title,

        message:
          config.message,

        confirmText:
          config.button,

        cancelText:
          'Vazgeç',

        variant:
          'info'
      });

    if (!confirmed) {
      return;
    }

    this.data[action](id)
      .subscribe({
        next:
          () => this.load(),

        error:
          error =>
            this.error.set(
              error?.error?.message
              ??
              'Sevkiyat işlemi başarısız.'
            )
      });
  }

  async cancel(
    id: string
  ): Promise<void> {
    const reason =
      await this.confirmDialog.prompt({
        title:
          'Sevkiyatı İptal Et',

        message:
          'İptal nedeni zorunludur ve sevkiyat geçmişine kaydedilecektir.',

        inputLabel:
          'İptal Nedeni',

        inputPlaceholder:
          'Örn: Müşteri talebi iptal edildi',

        confirmText:
          'Sevkiyatı İptal Et',

        cancelText:
          'Vazgeç',

        variant:
          'danger'
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
              'Sevkiyat iptal edilemedi.'
            )
      });
  }
}
