import { Component, Input } from '@angular/core';
import { MovementType } from '../../../../core/models/movement-type.enum';
import { StockMovement } from '../../../stock-movements/models/stock-movement';
@Component({selector:'app-product-movement-timeline',standalone:true,imports:[],templateUrl:'./product-movement-timeline.html',styleUrl:'./product-movement-timeline.scss'})
export class ProductMovementTimeline {
  @Input() movements:readonly StockMovement[]=[];
  label(t:MovementType):string{
    const x:Record<MovementType,string>={[MovementType.IN]:'Stok Girişi',[MovementType.OUT]:'Stok Çıkışı',[MovementType.ADJUSTMENT]:'Bakiye Düzeltme',[MovementType.TRANSFER_IN]:'Transfer Girişi',[MovementType.TRANSFER_OUT]:'Transfer Çıkışı'};return x[t];
  }
}