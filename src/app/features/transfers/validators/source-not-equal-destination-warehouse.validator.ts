import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';


export function
sourceNotEqualDestinationWarehouseValidator(
  sourceControlName:
    string =
      'sourceWarehouseId',

  destinationControlName:
    string =
      'destinationWarehouseId'
): ValidatorFn {

  return (
    control:
      AbstractControl
  ):
    ValidationErrors | null => {

    const sourceControl =
      control.get(
        sourceControlName
      );


    const destinationControl =
      control.get(
        destinationControlName
      );


    if (
      !sourceControl
      ||
      !destinationControl
    ) {
      return null;
    }


    const sourceWarehouseId =
      sourceControl.value;


    const destinationWarehouseId =
      destinationControl.value;


    if (
      !sourceWarehouseId
      ||
      !destinationWarehouseId
    ) {
      return null;
    }


    return sourceWarehouseId ===
      destinationWarehouseId

      ? {
          sameWarehouse: {
            sourceWarehouseId,
            destinationWarehouseId
          }
        }

      : null;
  };
}
