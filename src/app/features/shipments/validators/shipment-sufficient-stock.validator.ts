import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export interface ShipmentStockLineValue{productId:string;quantity:number;}
export interface ShipmentStockFormValue{sourceWarehouseId:string;items:readonly ShipmentStockLineValue[];}
export function shipmentSufficientStockValidator(getAvailableBalance:(productId:string,warehouseId:string)=>number):ValidatorFn{
  return(control:AbstractControl):ValidationErrors|null=>{
    const value=control.value as ShipmentStockFormValue|null|undefined;if(!value?.sourceWarehouseId||!Array.isArray(value.items)||value.items.length===0)return null;
    const requested=new Map<string,number>();for(const item of value.items){const q=Number(item?.quantity);if(!item?.productId||!Number.isFinite(q)||q<=0)continue;requested.set(item.productId,(requested.get(item.productId)??0)+q);}
    const insufficient:Array<{productId:string;requested:number;available:number}>=[];for(const[productId,quantity]of requested){const available=Number(getAvailableBalance(productId,value.sourceWarehouseId));if(quantity>available)insufficient.push({productId,requested:quantity,available});}
    return insufficient.length?{shipmentInsufficientStock:insufficient}:null;
  };
}