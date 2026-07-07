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
  Warehouse
} from '../../models/warehouse';

import {
  WarehouseDataService
} from '../../services/warehouse-data';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    RouterLink,
    PermissionDirective
  ],
  templateUrl: './warehouse-list.html',
  styleUrl: './warehouse-list.scss'
})
export class WarehouseList implements OnInit {
  private readonly data =
    inject(WarehouseDataService);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly warehouses =
    signal<Warehouse[]>([]);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly search =
    signal('');

  readonly filtered =
    computed(() => {
      const q =
        this.search()
          .trim()
          .toLocaleLowerCase(
            'tr-TR'
          );

      return this.warehouses()
        .filter(
          item =>
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
            item.city
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q)
            ||
            (
              item.district
              ?? ''
            )
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(q)
        );
    });

  readonly totalCapacity =
    computed(
      () =>
        this.warehouses()
          .reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              (
                item.capacity
                ?? 0
              ),
            0
          )
    );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.data
      .getAll({
        page: 1,
        pageSize: 100,
        sortBy: 'name',
        sortDirection: 'asc'
      })
      .subscribe({
        next: response => {
          this.warehouses.set(
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
            'Depolar yüklenemedi.'
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

  async remove(
    warehouse: Warehouse
  ): Promise<void> {
    const confirmed =
      await this.confirmDialog.confirm({
        title:
          'Depoyu Pasife Al',

        message:
          `"${warehouse.name}" deposu pasife alınacak. Devam etmek istediğinize emin misiniz?`,

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
      .delete(warehouse.id)
      .subscribe({
        next:
          () => this.load(),

        error:
          error =>
            this.error.set(
              error?.error?.message
              ??
              'Depo silinemedi.'
            )
      });
  }

  formatNumber(
    value: number
  ): string {
    return new Intl
      .NumberFormat('tr-TR')
      .format(value);
  }
}
