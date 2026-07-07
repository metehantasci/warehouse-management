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
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog';

import {
  PermissionDirective
} from '../../../../shared/directives/permission';

import {
  Product
} from '../../models/product';

import {
  ProductDataService
} from '../../services/product-data';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  private readonly data =
    inject(ProductDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly products =
    signal<Product[]>([]);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly search =
    signal('');

  readonly category =
    signal('Tümü');

  readonly categories =
    computed(() => [
      'Tümü',
      ...Array.from(
        new Set(
          this.products()
            .map(
              item =>
                item.category
            )
        )
      )
        .sort(
          (a, b) =>
            a.localeCompare(
              b,
              'tr'
            )
        )
    ]);

  readonly filtered =
    computed(() => {
      const q =
        this.search()
          .trim()
          .toLocaleLowerCase(
            'tr-TR'
          );

      const category =
        this.category();

      return this.products()
        .filter(item => {
          const matchesSearch =
            !q
            ||
            item.name
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q)
            ||
            item.code
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q)
            ||
            (
              item.barcode
              ?? ''
            )
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q);

          const matchesCategory =
            category === 'Tümü'
            ||
            item.category ===
              category;

          return (
            matchesSearch
            &&
            matchesCategory
          );
        });
    });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.data
      .getAll({
        page: 1,
        pageSize: 200,
        sortBy: 'name',
        sortDirection: 'asc'
      })
      .subscribe({
        next: response => {
          this.products.set(
            response.data.items
              .filter(
                item =>
                  item.isActive
              )
          );

          this.loading.set(false);
        },

        error: error => {
          this.error.set(
            error?.error?.message
            ??
            'Ürünler yüklenemedi.'
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

  onCategory(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLSelectElement
    ) {
      this.category.set(
        target.value
      );
    }
  }

  async remove(
    product: Product
  ): Promise<void> {
    const confirmed =
      await this.confirmDialog.confirm({
        title:
          'Ürünü Pasife Al',

        message:
          `"${product.name}" ürünü pasife alınacak. Bu işlemden sonra ürün aktif listede görünmez.`,

        confirmText:
          'Pasife Al',

        cancelText:
          'Vazgeç',

        variant:
          'danger'
      });

    if (!confirmed) {
      return;
    }

    this.data
      .delete(product.id)
      .subscribe({
        next:
          () => this.load(),

        error:
          error =>
            this.error.set(
              error?.error?.message
              ??
              'Ürün silinemedi.'
            )
      });
  }

  formatPrice(
    value: number
  ): string {
    return new Intl
      .NumberFormat(
        'tr-TR',
        {
          style: 'currency',
          currency: 'TRY',
          maximumFractionDigits: 0
        }
      )
      .format(value);
  }
}
