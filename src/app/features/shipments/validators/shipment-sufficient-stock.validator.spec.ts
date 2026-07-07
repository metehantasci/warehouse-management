import { FormControl } from '@angular/forms';
import { ShipmentStockFormValue, shipmentSufficientStockValidator } from './shipment-sufficient-stock.validator';
describe('shipmentSufficientStockValidator',()=>{
  const balances:Record<string,number>={'w1::p1':10,'w1::p2':4};
  const validator=shipmentSufficientStockValidator((p,w)=>balances[`${w}::${p}`]??0);
  it('accepts sufficient shipment',()=>{const v:ShipmentStockFormValue={sourceWarehouseId:'w1',items:[{productId:'p1',quantity:7},{productId:'p2',quantity:4}]};const c=new FormControl(v,{validators:validator});expect(c.errors).toBeNull();});
  it('merges duplicate lines before validation',()=>{const v:ShipmentStockFormValue={sourceWarehouseId:'w1',items:[{productId:'p1',quantity:6},{productId:'p1',quantity:5}]};const c=new FormControl(v,{validators:validator});expect(c.hasError('shipmentInsufficientStock')).toBe(true);});
});