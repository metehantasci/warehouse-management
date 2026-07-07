import { BaseEntity } from '../../../core/models/base-entity';

export interface Warehouse extends BaseEntity {
  code: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  capacity?: number;
  responsiblePerson?: string;
  phone?: string;
}
