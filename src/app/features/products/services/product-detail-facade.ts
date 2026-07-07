import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { StockMovement } from '../../stock-movements/models/stock-movement';
import { StockBalanceQueryService } from '../../stock-movements/services/stock-balance-query';
import { StockMovementDataService } from '../../stock-movements/services/stock-movement-data';
import { WarehouseDataService } from '../../warehouses/services/warehouse-data';
import { Product } from '../models/product';
import { ProductDataService } from './product-data';

export interface ProductWarehouseBalance {
  warehouseId:string; warehouseCode:string; warehouseName:string; city:string;
  quantity:number; lastMovementAt:string|null;
}
export interface ProductDetailViewModel {
  product:Product; balances:ProductWarehouseBalance[]; movements:StockMovement[]; totalStock:number;
}

@Injectable({providedIn:'root'})
export class ProductDetailFacadeService {
  private readonly productData=inject(ProductDataService);
  private readonly movementData=inject(StockMovementDataService);
  private readonly warehouseData=inject(WarehouseDataService);
  private readonly balanceQuery=inject(StockBalanceQueryService);

  load(productId:string):Observable<ProductDetailViewModel> {
    return forkJoin({
      product:this.productData.getById(productId),
      movements:this.movementData.getAll({page:1,pageSize:1000,sortBy:'createdAt',sortDirection:'desc'}),
      warehouses:this.warehouseData.getAll({page:1,pageSize:300,sortBy:'name',sortDirection:'asc'})
    }).pipe(map(r=>{
      const all=r.movements.data.items;
      const movements=all.filter(x=>x.productId===productId&&!x.isCancelled).slice().sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
      const calculated=this.balanceQuery.calculateBalances(all).filter(x=>x.productId===productId);
      const balances=r.warehouses.data.items.filter(x=>x.isActive).map(w=>{
        const b=calculated.find(x=>x.warehouseId===w.id);
        return {warehouseId:w.id,warehouseCode:w.code,warehouseName:w.name,city:w.city,quantity:b?.quantity??0,lastMovementAt:b?.lastMovementAt??null};
      }).sort((a,b)=>b.quantity-a.quantity);
      return {product:r.product.data,balances,movements,totalStock:balances.reduce((s,x)=>s+x.quantity,0)};
    }));
  }
}