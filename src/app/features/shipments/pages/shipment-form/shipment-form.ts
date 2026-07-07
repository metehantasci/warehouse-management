import {
  Component,
  OnInit,
  effect,
  inject
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
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
  ShipmentFormFacadeService
} from '../../services/shipment-form-facade';

@Component({
  selector: 'app-shipment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './shipment-form.html',
  styleUrl: './shipment-form.scss'
})
export class ShipmentForm implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly facade =
    inject(ShipmentFormFacadeService);

  readonly form =
    this.fb.nonNullable.group({
      sourceWarehouseId: [
        '',
        Validators.required
      ],

      destinationName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(160)
        ]
      ],

      destinationAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(400)
        ]
      ],

      plannedDate: [
        new Date()
          .toISOString()
          .slice(0, 10),
        Validators.required
      ],

      note: [
        '',
        Validators.maxLength(300)
      ],

      items:
        this.fb.array<FormGroup>([])
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

      this.form.controls
        .sourceWarehouseId
        .setValue(
          warehouses[0].id
        );

      if (
        this.items.length === 0
      ) {
        this.addItem();
      }

      this.form.markAsPristine();
    });

  get items():
    FormArray<FormGroup> {
    return this.form.controls.items;
  }

  ngOnInit(): void {
    this.facade.loadOptions();
  }

  addItem(): void {
    this.items.push(
      this.createItemGroup()
    );

    this.form.markAsDirty();
  }

  removeItem(
    index: number
  ): void {
    if (
      this.items.length <= 1
    ) {
      return;
    }

    this.items.removeAt(index);
    this.form.markAsDirty();
  }

  submit(): void {
    this.submitError = null;

    if (
      this.form.invalid
      ||
      this.items.length === 0
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    const items =
      value.items
        .map(
          item => ({
            productId:
              String(
                item['productId']
                ?? ''
              ),

            quantity:
              Number(
                item['quantity']
                ?? 0
              )
          })
        )
        .filter(
          item =>
            !!item.productId
            &&
            item.quantity > 0
        );

    if (items.length === 0) {
      this.submitError =
        'En az bir geçerli sevkiyat kalemi eklemelisiniz.';
      return;
    }

    this.saving = true;

    this.facade
      .create({
        sourceWarehouseId:
          value.sourceWarehouseId,

        destinationName:
          value.destinationName.trim(),

        destinationAddress:
          value.destinationAddress.trim(),

        plannedDate:
          value.plannedDate,

        items,

        note:
          value.note.trim()
          || undefined
      })
      .subscribe({
        next: shipment => {
          this.saving = false;
          this.form.markAsPristine();

          this.router.navigate([
            '/sevkiyatlar',
            shipment.id
          ]);
        },

        error: error => {
          this.saving = false;

          this.submitError =
            error?.error?.message
            ??
            error?.message
            ??
            'Sevkiyat oluşturulamadı.';
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
        'Sevkiyat formunda kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinize emin misiniz?',

      confirmText:
        'Çık',

      cancelText:
        'Formda Kal',

      variant:
        'warning'
    });
  }

  private createItemGroup():
    FormGroup {
    return this.fb.nonNullable.group({
      productId: [
        this.facade.products()[0]?.id
        ?? '',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }
}
