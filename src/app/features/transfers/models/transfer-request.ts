import { BaseEntity } from '../../../core/models/base-entity';
import { TransferStatus } from '../../../core/models/transfer-status.enum';

export interface TransferRequest extends BaseEntity {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  status: TransferStatus;
  requestedByUserId: string;
  approvedByUserId?: string;
  requestedAt: string;
  decidedAt?: string;
  note?: string;
  cancellationReason?: string;
}
