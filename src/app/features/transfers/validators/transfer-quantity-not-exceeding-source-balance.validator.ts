import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';


export function
transferQuantityNotExceedingSourceBalanceValidator(
  getSourceBalance:
    () => number
): ValidatorFn {

  return (
    control:
      AbstractControl
  ):
    ValidationErrors | null => {

    const rawValue =
      control.value;


    if (
      rawValue === null
      ||
      rawValue === undefined
      ||
      rawValue === ''
    ) {
      return null;
    }


    const quantity =
      Number(rawValue);


    if (
      !Number.isFinite(
        quantity
      )
      ||
      quantity <= 0
    ) {
      return null;
    }


    const currentBalance =
      Number(
        getSourceBalance()
      );


    if (
      !Number.isFinite(
        currentBalance
      )
    ) {
      return {
        invalidSourceBalance:
          true
      };
    }


    return quantity >
      currentBalance

      ? {
          transferQuantityExceedsSourceBalance: {
            currentBalance,
            requestedQuantity:
              quantity
          }
        }

      : null;
  };
}
