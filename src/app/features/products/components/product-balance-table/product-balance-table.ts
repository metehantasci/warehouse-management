import { Component, Input } from '@angular/core';
import { ProductWarehouseBalance } from '../../services/product-detail-facade';
@Component({selector:'app-product-balance-table',standalone:true,imports:[],templateUrl:'./product-balance-table.html',styleUrl:'./product-balance-table.scss'})
export class ProductBalanceTable {
  @Input() rows:readonly ProductWarehouseBalance[]=[];
  formatNumber(v:number):string{return new Intl.NumberFormat('tr-TR').format(v);}
}