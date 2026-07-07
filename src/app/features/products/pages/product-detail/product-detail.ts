import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PermissionDirective } from '../../../../shared/directives/permission';
import { ProductBalanceTable } from '../../components/product-balance-table/product-balance-table';
import { ProductMovementTimeline } from '../../components/product-movement-timeline/product-movement-timeline';
import { ProductDetailFacadeService, ProductDetailViewModel } from '../../services/product-detail-facade';

@Component({selector:'app-product-detail',standalone:true,imports:[RouterLink,PermissionDirective,ProductBalanceTable,ProductMovementTimeline],templateUrl:'./product-detail.html',styleUrl:'./product-detail.scss'})
export class ProductDetail implements OnInit {
  private readonly route=inject(ActivatedRoute);
  private readonly detailFacade=inject(ProductDetailFacadeService);
  readonly viewModel=signal<ProductDetailViewModel|null>(null);
  readonly loading=signal(true);
  readonly error=signal<string|null>(null);
  ngOnInit():void{
    const id=this.route.snapshot.paramMap.get('id');
    if(!id){this.error.set('Ürün ID bulunamadı.');this.loading.set(false);return;}
    this.detailFacade.load(id).subscribe({next:v=>{this.viewModel.set(v);this.loading.set(false);},error:e=>{this.error.set(e?.error?.message??e?.message??'Ürün detayları yüklenemedi.');this.loading.set(false);}});
  }
  formatPrice(v:number):string{return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(v);}
  formatNumber(v:number):string{return new Intl.NumberFormat('tr-TR').format(v);}
}