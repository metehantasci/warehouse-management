import {
  Component,
  DestroyRef,
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
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  MovementType
} from '../../../../core/models/movement-type.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  StockMovementFormFacadeService
} from '../../services/stock-movement-form-facade';

@Component({
  selector: 'app-stock-movement-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './stock-movement-form.html',
  styleUrl: './stock-movement-form.scss'
})
export class StockMovementForm implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly facade =
    inject(
      StockMovementFormFacadeService
    );

  readonly movementType =
    MovementType;

  readonly typeOptions = [
    MovementType.IN,
    MovementType.OUT,
    MovementType.ADJUSTMENT
  ];

  readonly form =
    this.fb.nonNullable.group({
      productId: [
        '',
        Validators.required
      ],

      warehouseId: [
        '',
        Validators.required
      ],

      type: [
        MovementType.IN,
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      targetBalance: [
        0,
        Validators.min(0)
      ],

      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(300)
        ]
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

        warehouseId:
          warehouses[0].id
      });

      this.form.markAsPristine();
    });

  ngOnInit(): void {
    this.facade.loadOptions();

    this.form.controls.type
      .valueChanges
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        type =>
          this.applyTypeValidators(
            type
          )
      );

    this.applyTypeValidators(
      this.form.controls.type.value
    );
  }

  get isAdjustment(): boolean {
    return (
      this.form.controls.type.value
      ===
      MovementType.ADJUSTMENT
    );
  }

  typeLabel(
    type: MovementType
  ): string {
    switch (type) {
      case MovementType.IN:
        return 'Stok Girişi';

      case MovementType.OUT:
        return 'Stok Çıkışı';

      case MovementType.ADJUSTMENT:
        return 'Stok Düzeltme';

      default:
        return String(type);
    }
  }

  submit(): void {
    this.submitError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {
      this.facade
        .create(
          this.form.getRawValue()
        )
        .subscribe({
          next: movement => {
            this.saving = false;
            this.form.markAsPristine();

            this.router.navigate([
              '/stok-hareketleri',
              movement.id
            ]);
          },

          error: error => {
            this.saving = false;

            this.submitError =
              error?.error?.message
              ??
              error?.message
              ??
              'Stok hareketi oluşturulamadı.';
          }
        });
    } catch (error) {
      this.saving = false;

      this.submitError =
        error instanceof Error
          ? error.message
          : 'Stok hareketi oluşturulamadı.';
    }
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
        'Stok hareketi formunda kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinize emin misiniz?',

      confirmText:
        'Çık',

      cancelText:
        'Formda Kal',

      variant:
        'warning'
    });
  }

  private applyTypeValidators(
    type: MovementType
  ): void {
    const quantity =
      this.form.controls.quantity;

    const targetBalance =
      this.form.controls.targetBalance;

    if (
      type ===
      MovementType.ADJUSTMENT
    ) {
      quantity.clearValidators();

      targetBalance.setValidators([
        Validators.required,
        Validators.min(0)
      ]);
    } else {
      quantity.setValidators([
        Validators.required,
        Validators.min(1)
      ]);

      targetBalance.setValidators([
        Validators.min(0)
      ]);
    }

    quantity.updateValueAndValidity({
      emitEvent: false
    });

    targetBalance
      .updateValueAndValidity({
        emitEvent: false
      });
  }
}
