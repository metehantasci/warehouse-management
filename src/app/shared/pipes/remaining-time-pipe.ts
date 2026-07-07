import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'remainingTime',
  standalone: true
})
export class RemainingTimePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    now = new Date()
  ): string {
    if (!value) {
      return '-';
    }

    const target =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(target.getTime())) {
      return '-';
    }

    const diffMs =
      target.getTime() - now.getTime();

    const isPast = diffMs < 0;
    const absoluteMs = Math.abs(diffMs);

    const totalMinutes =
      Math.floor(absoluteMs / 60_000);

    const days =
      Math.floor(totalMinutes / 1_440);

    const hours =
      Math.floor((totalMinutes % 1_440) / 60);

    const minutes =
      totalMinutes % 60;

    let text: string;

    if (days > 0) {
      text = `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      text = `${hours} saat ${minutes} dk`;
    } else {
      text = `${minutes} dk`;
    }

    return isPast
      ? `${text} geçti`
      : `${text} kaldı`;
  }
}
