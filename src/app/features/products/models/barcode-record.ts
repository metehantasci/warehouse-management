import { BaseEntity } from '../../../core/models/base-entity';

export interface BarcodeRecord extends BaseEntity {
  barcode: string;
  productId: string;
  assignedAt: string;
}
