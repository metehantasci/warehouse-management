import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function requiredIfValidator(
  dependentControlName: string,
  expectedValue: unknown
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;

    if (!parent) {
      return null;
    }

    const dependentControl = parent.get(dependentControlName);

    if (!dependentControl) {
      return null;
    }

    const shouldBeRequired =
      dependentControl.value === expectedValue;

    if (!shouldBeRequired) {
      return null;
    }

    const value = control.value;

    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '');

    return isEmpty
      ? {
          requiredIf: {
            dependentControlName,
            expectedValue
          }
        }
      : null;
  };
}
