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
  Warehouse
} from '../../models/warehouse';

import {
  WarehouseDataService
} from '../../services/warehouse-data';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './warehouse-detail.html',
  styleUrl: './warehouse-detail.scss'
})
export class WarehouseDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(WarehouseDataService);

  readonly warehouse = signal<Warehouse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Depo ID bulunamadı.');
      this.loading.set(false);
      return;
    }

    this.data.getById(id).subscribe({
      next: response => {
        this.warehouse.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error?.error?.message ?? 'Depo bulunamadı.');
        this.loading.set(false);
      }
    });
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('tr-TR').format(value);
  }
}
