import {
  Routes
} from '@angular/router';

import {
  CriticalStock
} from './pages/critical-stock/critical-stock';


export const CRITICAL_STOCK_ROUTES:
  Routes = [
    {
      path: '',
      component: CriticalStock
    }
  ];
