import { MovementType } from '../../../core/models/movement-type.enum';
import { UserRole } from '../../../core/models/user-role.enum';

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  previousBalance: number;
  newBalance: number;
  relatedTransferId?: string;
  relatedShipmentId?: string;
  performedByUserId: string;
  performedByRole: UserRole;
  reason: string;
  createdAt: string;
  updatedAt: string;
  isCancelled: boolean;
}
