import {
  Component,
  OnInit,
  effect,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  TransferFormFacadeService
} from '../../services/transfer-form-facade';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.scss'
})
export class TransferForm implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly facade =
    inject(TransferFormFacadeService);

  readonly form =
    this.fb.nonNullable.group({
      productId: [
        '',
        Validators.required
      ],

      sourceWarehouseId: [
        '',
        Validators.required
      ],

      destinationWarehouseId: [
        '',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      note: [
        '',
        Validators.maxLength(300)
      ]
    });

  saving = false;
  submitError:
    string | null = null;

  private optionsInitialized =
    false;

  private readonly syncOptions =
    effect(() => {
      if (
        this.optionsInitialized
        ||
        this.facade.loading()
      ) {
        return;
      }

      const products =
        this.facade.products();

      const warehouses =
        this.facade.warehouses();

      if (
        products.length === 0
        ||
        warehouses.length === 0
      ) {
        return;
      }

      this.optionsInitialized = true;

      this.form.patchValue({
        productId:
          products[0].id,

        sourceWarehouseId:
          warehouses[0].id,

        destinationWarehouseId:
          warehouses[1]?.id
          ?? warehouses[0].id
      });

      this.form.markAsPristine();
    });

  ngOnInit(): void {
    this.facade.loadOptions();
  }

  submit(): void {
    this.submitError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    if (
      value.sourceWarehouseId
      ===
      value.destinationWarehouseId
    ) {
      this.submitError =
        'Kaynak ve hedef depo aynı olamaz.';
      return;
    }

    this.saving = true;

    this.facade
      .create({
        productId:
          value.productId,

        sourceWarehouseId:
          value.sourceWarehouseId,

        destinationWarehouseId:
          value.destinationWarehouseId,

        quantity:
          Number(value.quantity),

        note:
          value.note.trim()
          || undefined
      })
      .subscribe({
        next: transfer => {
          this.saving = false;
          this.form.markAsPristine();

          this.router.navigate([
            '/transferler',
            transfer.id
          ]);
        },

        error: error => {
          this.saving = false;

          this.submitError =
            error?.error?.message
            ??
            error?.message
            ??
            'Transfer oluşturulamadı.';
        }
      });
  }

  async canDeactivate():
    Promise<boolean> {
    if (
      !this.form.dirty
      ||
      this.saving
    ) {
      return true;
    }

    return this.confirmDialog.confirm({
      title:
        'Kaydedilmemiş Değişiklikler',

      message:
        'Transfer formunda kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinize emin misiniz?',

      confirmText:
        'Çık',

      cancelText:
        'Formda Kal',

      variant:
        'warning'
    });
  }
}
