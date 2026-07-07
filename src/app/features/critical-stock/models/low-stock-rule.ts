import { BaseEntity } from '../../../core/models/base-entity';

export interface LowStockRule extends BaseEntity {
  productId: string;
  warehouseId?: string;
  minQuantity: number;
}
