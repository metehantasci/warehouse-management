import { FormControl } from '@angular/forms';
import { stockOutNotExceedingBalanceValidator } from './stock-out-not-exceeding-balance.validator';
describe('stockOutNotExceedingBalanceValidator',()=>{
  it('accepts quantity within balance',()=>{const c=new FormControl(7,stockOutNotExceedingBalanceValidator(()=>10));expect(c.errors).toBeNull();});
  it('rejects quantity above balance',()=>{const c=new FormControl(11,stockOutNotExceedingBalanceValidator(()=>10));expect(c.hasError('stockOutExceedsBalance')).toBe(true);});
});