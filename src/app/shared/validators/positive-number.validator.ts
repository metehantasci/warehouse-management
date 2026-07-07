import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const numericValue = Number(value);

    if (
      Number.isNaN(numericValue) ||
      !Number.isFinite(numericValue) ||
      numericValue <= 0
    ) {
      return {
        positiveNumber: {
          actualValue: value
        }
      };
    }

    return null;
  };
}
