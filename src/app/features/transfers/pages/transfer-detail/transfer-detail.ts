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
  TransferStatus
} from '../../../../core/models/transfer-status.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  PermissionDirective
} from '../../../../shared/directives/permission';

import {
  TransferRequest
} from '../../models/transfer-request';

import {
  TransferDataService
} from '../../services/transfer-data';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './transfer-detail.html',
  styleUrl: './transfer-detail.scss'
})
export class TransferDetail implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly data =
    inject(TransferDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly transfer =
    signal<TransferRequest | null>(
      null
    );

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly pending =
    TransferStatus.PENDING;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id =
      this.route.snapshot
        .paramMap.get('id');

    if (!id) {
      this.error.set(
        'Transfer ID bulunamadı.'
      );

      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.data
      .getById(id)
      .subscribe({
        next: response => {
          this.transfer.set(
            response.data
          );

          this.loading.set(false);
        },

        error: error => {
          this.error.set(
            error?.error?.message
            ??
            'Transfer bulunamadı.'
          );

          this.loading.set(false);
        }
      });
  }

  async approve(
    id: string
  ): Promise<void> {
    const confirmed =
      await this.confirmDialog.confirm({
        title:
          'Transferi Onayla',

        message:
          'Bu transfer talebi onaylanacak ve hedef depo stok hareketi oluşturulacaktır.',

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
              'Onay başarısız.'
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
