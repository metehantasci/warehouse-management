import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {

  generate(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    return [
      Date.now().toString(36),
      Math.random().toString(36).slice(2, 10)
    ].join('-');
  }

  generateCode(
    prefix: string,
    sequence?: number
  ): string {
    const normalizedPrefix =
      prefix.trim().toUpperCase();

    const numericPart =
      sequence !== undefined
        ? sequence.toString().padStart(5, '0')
        : Date.now().toString().slice(-6);

    return `${normalizedPrefix}-${numericPart}`;
  }
}
