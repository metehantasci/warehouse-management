import { BaseEntity } from '../../../core/models/base-entity';
import { ShipmentStatus } from '../../../core/models/shipment-status.enum';
import { ShipmentItem } from './shipment-item';

export interface Shipment extends BaseEntity {
  code: string;
  sourceWarehouseId: string;
  destinationName: string;
  destinationAddress: string;
  plannedDate: string;
  status: ShipmentStatus;
  items: ShipmentItem[];
  note?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}
