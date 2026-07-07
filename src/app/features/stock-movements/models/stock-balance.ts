export interface StockBalance {
  productId: string;
  warehouseId: string;
  quantity: number;
  lastMovementAt: string | null;
}
