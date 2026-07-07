import { FormControl } from '@angular/forms';
import { uniqueActiveBarcodeValidator } from './unique-active-barcode.validator';
describe('uniqueActiveBarcodeValidator',()=>{
  const products=[{id:'p1',barcode:'8691',isActive:true},{id:'p2',barcode:'8692',isActive:false}];
  it('rejects duplicate active barcode',()=>{const c=new FormControl('8691',uniqueActiveBarcodeValidator(()=>products));expect(c.hasError('uniqueActiveBarcode')).toBe(true);});
  it('allows own barcode while editing',()=>{const c=new FormControl('8691',uniqueActiveBarcodeValidator(()=>products,()=> 'p1'));expect(c.errors).toBeNull();});
});