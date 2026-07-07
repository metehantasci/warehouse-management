import {
  HttpClient
} from '@angular/common/http';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  ApiResponse
} from '../../../../core/models/api-response';

import {
  StockStatus
} from '../../../../core/models/stock-status.enum';

import {
  InventoryQuery
} from '../../../stock-movements/models/inventory-query';


@Component({
  selector: 'app-critical-stock',
  standalone: true,

  imports: [],

  templateUrl: './critical-stock.html',
  styleUrl: './critical-stock.scss'
})
export class CriticalStock
  implements OnInit {

  private readonly http =
    inject(HttpClient);


  readonly items =
    signal<InventoryQuery[]>([]);


  readonly loading =
    signal(false);


  readonly error =
    signal<string | null>(null);


  readonly search =
    signal('');


  readonly filtered =
    computed(() => {

      const query =
        this.search()
          .trim()
          .toLocaleLowerCase(
            'tr-TR'
          );


      return this.items()
        .filter(item => {

          return (
            !query
            ||
            item.productName
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(query)
            ||
            item.productCode
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(query)
            ||
            item.warehouseName
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(query)
          );
        });
    });


  readonly outCount =
    computed(() => {

      return this.items()
        .filter(
          item =>
            item.status ===
              StockStatus.OUT_OF_STOCK
        )
        .length;
    });


  readonly criticalCount =
    computed(() => {

      return this.items()
        .filter(
          item =>
            item.status ===
              StockStatus.CRITICAL
        )
        .length;
    });


  ngOnInit(): void {

    this.load();
  }


  load(): void {

    this.loading.set(true);

    this.error.set(null);


    this.http
      .get<
        ApiResponse<
          InventoryQuery[]
        >
      >(
        '/api/critical-stock'
      )
      .subscribe({

        next: response => {

          this.items.set(
            response.data
          );

          this.loading.set(false);
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Kritik stok verileri yüklenemedi.'
          );

          this.loading.set(false);
        }
      });
  }


  onSearch(
    event: Event
  ): void {

    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }


    this.search.set(
      input.value
    );
  }


  statusLabel(
    status: StockStatus
  ): string {

    const labels:
      Record<
        StockStatus,
        string
      > = {

        [StockStatus.NORMAL]:
          'Normal',

        [StockStatus.LOW]:
          'Düşük',

        [StockStatus.CRITICAL]:
          'Kritik',

        [StockStatus.OUT_OF_STOCK]:
          'Tükendi'
      };


    return labels[status];
  }
}


