import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function dateRangeValidator(
  startControlName: string,
  endControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startControl = control.get(startControlName);
    const endControl = control.get(endControlName);

    if (!startControl || !endControl) {
      return null;
    }

    const startValue = startControl.value;
    const endValue = endControl.value;

    if (!startValue || !endValue) {
      return null;
    }

    const startDate = new Date(startValue);
    const endDate = new Date(endValue);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return {
        invalidDateRange: true
      };
    }

    return startDate.getTime() <= endDate.getTime()
      ? null
      : {
          dateRange: {
            start: startValue,
            end: endValue
          }
        };
  };
}
