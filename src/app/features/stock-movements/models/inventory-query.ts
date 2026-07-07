import { StockStatus } from '../../../core/models/stock-status.enum';

export interface InventoryQuery {
  productId: string;
  productName: string;
  productCode: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  minQuantity: number;
  status: StockStatus;
}
