import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appDate',
  standalone: true
})
export class AppDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    includeTime = true
  ): string {
    if (!value) {
      return '-';
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime
        ? {
            hour: '2-digit',
            minute: '2-digit'
          }
        : {})
    }).format(date);
  }
}
