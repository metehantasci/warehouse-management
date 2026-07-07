import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function stockOutNotExceedingBalanceValidator(getAvailableBalance:()=>number):ValidatorFn{
  return(control:AbstractControl):ValidationErrors|null=>{
    if(control.value===null||control.value===''||control.value===undefined)return null;
    const requested=Number(control.value),available=Number(getAvailableBalance());
    if(!Number.isFinite(requested)||requested<=0||requested<=available)return null;
    return{stockOutExceedsBalance:{requested,available}};
  };
}