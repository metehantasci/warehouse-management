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
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  UnitOfMeasure
} from '../../../../core/models/unit-of-measure.enum';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  IdGeneratorService
} from '../../../../core/services/id-generator';

import {
  Product
} from '../../models/product';

import {
  ProductFacadeService
} from '../../services/product-facade';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly idGenerator =
    inject(IdGeneratorService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly facade =
    inject(ProductFacadeService);

  readonly units =
    Object.values(UnitOfMeasure);

  readonly editId =
    this.route.snapshot.paramMap.get('id');

  readonly isEditMode =
    this.editId !== null;

  readonly form =
    this.fb.nonNullable.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120)
        ]
      ],

      category: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80)
        ]
      ],

      unit: [
        UnitOfMeasure.ADET,
        Validators.required
      ],

      barcode: [
        '',
        Validators.maxLength(80)
      ],

      unitPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      defaultMinQuantity: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      description: [
        '',
        Validators.maxLength(500)
      ]
    });

  saving = false;

  private patchedProductId:
    string | null = null;

  private readonly syncSelectedProduct =
    effect(() => {
      const item =
        this.facade.selectedProduct();

      if (
        !item
        ||
        !this.editId
        ||
        item.id !== this.editId
        ||
        this.patchedProductId === item.id
      ) {
        return;
      }

      this.patchedProductId = item.id;

      this.form.patchValue({
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        barcode: item.barcode ?? '',
        unitPrice: item.unitPrice,
        defaultMinQuantity:
          item.defaultMinQuantity,
        description:
          item.description ?? ''
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });

  private readonly syncErrorState =
    effect(() => {
      if (this.facade.error()) {
        this.saving = false;
      }
    });

  ngOnInit(): void {
    if (this.editId) {
      this.facade.loadById(
        this.editId
      );
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    this.saving = true;

    if (
      this.isEditMode
      &&
      this.editId
    ) {
      this.facade.update(
        this.editId,
        {
          code:
            value.code.trim(),

          name:
            value.name.trim(),

          category:
            value.category.trim(),

          unit:
            value.unit,

          barcode:
            value.barcode.trim()
            || null,

          unitPrice:
            Number(value.unitPrice),

          defaultMinQuantity:
            Number(
              value.defaultMinQuantity
            ),

          description:
            value.description.trim()
            || undefined
        },
        updated => {
          this.saving = false;
          this.form.markAsPristine();

          this.router.navigate([
            '/urunler',
            updated.id
          ]);
        }
      );

      return;
    }

    const now =
      new Date().toISOString();

    const product: Product = {
      id:
        this.idGenerator.generate(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      category:
        value.category.trim(),

      unit:
        value.unit,

      barcode:
        value.barcode.trim()
        || null,

      unitPrice:
        Number(value.unitPrice),

      defaultMinQuantity:
        Number(
          value.defaultMinQuantity
        ),

      description:
        value.description.trim()
        || undefined,

      isActive:
        true,

      createdAt:
        now,

      updatedAt:
        now
    };

    this.facade.create(
      product,
      created => {
        this.saving = false;
        this.form.markAsPristine();

        this.router.navigate([
          '/urunler',
          created.id
        ]);
      }
    );
  }

  fieldInvalid(
    name:
      keyof typeof this.form.controls
  ): boolean {
    const control =
      this.form.controls[name];

    return (
      control.invalid
      &&
      (
        control.touched
        ||
        control.dirty
      )
    );
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
        'Ürün formunda kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinize emin misiniz?',

      confirmText:
        'Çık',

      cancelText:
        'Formda Kal',

      variant:
        'warning'
    });
  }
}
