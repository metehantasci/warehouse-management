import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: true
})
export class MoneyPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currency = 'TRY'
  ): string {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {
      return '-';
    }

    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
