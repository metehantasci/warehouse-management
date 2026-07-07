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
  ShipmentStatus
} from '../../../../core/models/shipment-status.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  PermissionDirective
} from '../../../../shared/directives/permission';

import {
  Shipment
} from '../../models/shipment';

import {
  ShipmentDataService
} from '../../services/shipment-data';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './shipment-detail.html',
  styleUrl: './shipment-detail.scss'
})
export class ShipmentDetail implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly data =
    inject(ShipmentDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly shipment =
    signal<Shipment | null>(null);

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly PLANNED =
    ShipmentStatus.PLANNED;

  readonly CONFIRMED =
    ShipmentStatus.CONFIRMED;

  readonly SHIPPED =
    ShipmentStatus.SHIPPED;

  readonly DELIVERED =
    ShipmentStatus.DELIVERED;

  readonly CANCELLED =
    ShipmentStatus.CANCELLED;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id =
      this.route.snapshot
        .paramMap.get('id');

    if (!id) {
      this.error.set(
        'Sevkiyat ID bulunamadı.'
      );

      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.data
      .getById(id)
      .subscribe({
        next: response => {
          this.shipment.set(
            response.data
          );

          this.loading.set(false);
        },

        error: error => {
          this.error.set(
            error?.error?.message
            ??
            'Sevkiyat bulunamadı.'
          );

          this.loading.set(false);
        }
      });
  }

  async run(
    id: string,
    action:
      | 'confirm'
      | 'ship'
      | 'deliver'
  ): Promise<void> {
    const config = {
      confirm: {
        title:
          'Sevkiyatı Onayla',

        message:
          'Sevkiyat operasyon akışına alınacaktır.',

        button:
          'Onayla'
      },

      ship: {
        title:
          'Sevkiyatı Yola Çıkar',

        message:
          'Sevkiyat yola çıktı durumuna alınacaktır.',

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

    const item =
      config[action];

    const confirmed =
      await this.confirmDialog.confirm({
        title:
          item.title,

        message:
          item.message,

        confirmText:
          item.button,

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
              'İşlem başarısız.'
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
          'İptal nedeni zorunludur ve işlem geçmişine kaydedilecektir.',

        inputLabel:
          'İptal Nedeni',

        inputPlaceholder:
          'İptal nedenini yazın',

        confirmText:
          'İptal Et',

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
              'İptal başarısız.'
            )
      });
  }
}
