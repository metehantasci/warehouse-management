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
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  IdGeneratorService
} from '../../../../core/services/id-generator';

import {
  Warehouse
} from '../../models/warehouse';

import {
  WarehouseFacadeService
} from '../../services/warehouse-facade';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './warehouse-form.html',
  styleUrl: './warehouse-form.scss'
})
export class WarehouseForm implements OnInit {
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
    inject(WarehouseFacadeService);

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

      address: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(300)
        ]
      ],

      city: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80)
        ]
      ],

      district: [
        '',
        Validators.maxLength(80)
      ],

      capacity: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      responsiblePerson: [
        '',
        Validators.maxLength(120)
      ],

      phone: [
        '',
        Validators.maxLength(40)
      ]
    });

  saving = false;

  private patchedWarehouseId:
    string | null = null;

  private readonly syncSelectedWarehouse =
    effect(() => {
      const item =
        this.facade.selectedWarehouse();

      if (
        !item
        ||
        !this.editId
        ||
        item.id !== this.editId
        ||
        this.patchedWarehouseId === item.id
      ) {
        return;
      }

      this.patchedWarehouseId = item.id;

      this.form.patchValue({
        code: item.code,
        name: item.name,
        address: item.address,
        city: item.city,
        district:
          item.district ?? '',
        capacity:
          item.capacity ?? 0,
        responsiblePerson:
          item.responsiblePerson ?? '',
        phone:
          item.phone ?? ''
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

          address:
            value.address.trim(),

          city:
            value.city.trim(),

          district:
            value.district.trim()
            || undefined,

          capacity:
            Number(value.capacity),

          responsiblePerson:
            value.responsiblePerson
              .trim()
            || undefined,

          phone:
            value.phone.trim()
            || undefined
        },
        updated => {
          this.saving = false;
          this.form.markAsPristine();

          this.router.navigate([
            '/depolar',
            updated.id
          ]);
        }
      );

      return;
    }

    const now =
      new Date().toISOString();

    const warehouse: Warehouse = {
      id:
        this.idGenerator.generate(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      address:
        value.address.trim(),

      city:
        value.city.trim(),

      district:
        value.district.trim()
        || undefined,

      capacity:
        Number(value.capacity),

      responsiblePerson:
        value.responsiblePerson
          .trim()
        || undefined,

      phone:
        value.phone.trim()
        || undefined,

      isActive:
        true,

      createdAt:
        now,

      updatedAt:
        now
    };

    this.facade.create(
      warehouse,
      created => {
        this.saving = false;
        this.form.markAsPristine();

        this.router.navigate([
          '/depolar',
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
        'Depo formunda kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinize emin misiniz?',

      confirmText:
        'Çık',

      cancelText:
        'Formda Kal',

      variant:
        'warning'
    });
  }
}
