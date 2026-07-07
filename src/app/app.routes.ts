import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LoginPage } from './features/auth/pages/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { NotFoundPage } from './pages/not-found/not-found';

export const routes:Routes=[
  {path:'login',component:LoginPage},
  {path:'',component:MainLayout,canActivate:[authGuard],children:[
    {path:'',pathMatch:'full',redirectTo:'dashboard'},
    {path:'dashboard',loadChildren:()=>import('./features/dashboard/dashboard.routes').then(m=>m.DASHBOARD_ROUTES)},
    {path:'urunler',loadChildren:()=>import('./features/products/products.routes').then(m=>m.PRODUCTS_ROUTES)},
    {path:'depolar',loadChildren:()=>import('./features/warehouses/warehouses.routes').then(m=>m.WAREHOUSES_ROUTES)},
    {path:'stok-hareketleri',loadChildren:()=>import('./features/stock-movements/stock-movements.routes').then(m=>m.STOCK_MOVEMENTS_ROUTES)},
    {path:'transferler',loadChildren:()=>import('./features/transfers/transfers.routes').then(m=>m.TRANSFERS_ROUTES)},
    {path:'sevkiyatlar',loadChildren:()=>import('./features/shipments/shipments.routes').then(m=>m.SHIPMENTS_ROUTES)},
    {path:'kritik-stok',loadChildren:()=>import('./features/critical-stock/critical-stock.routes').then(m=>m.CRITICAL_STOCK_ROUTES)},
    {path:'raporlar',loadChildren:()=>import('./features/reports/reports.routes').then(m=>m.REPORTS_ROUTES)},
    {path:'audit-log',loadChildren:()=>import('./features/audit-log/audit-log.routes').then(m=>m.AUDIT_LOG_ROUTES)}
  ]},
  {path:'**',component:NotFoundPage}
];