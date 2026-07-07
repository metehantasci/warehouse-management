import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export interface ActiveBarcodeCandidate{id:string;barcode:string|null|undefined;isActive:boolean;}
export function uniqueActiveBarcodeValidator(getProducts:()=>readonly ActiveBarcodeCandidate[],getCurrentProductId:()=>string|null=()=>null):ValidatorFn{
  return(control:AbstractControl):ValidationErrors|null=>{
    const value=String(control.value??'').trim().toLocaleLowerCase('tr-TR');if(!value)return null;const currentId=getCurrentProductId();
    const duplicate=getProducts().some(p=>p.isActive&&p.id!==currentId&&String(p.barcode??'').trim().toLocaleLowerCase('tr-TR')===value);
    return duplicate?{uniqueActiveBarcode:true}:null;
  };
}