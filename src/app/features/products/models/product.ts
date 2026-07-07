import { BaseEntity } from '../../../core/models/base-entity';
import { UnitOfMeasure } from '../../../core/models/unit-of-measure.enum';

export interface Product extends BaseEntity {
  code: string;
  name: string;
  category: string;
  unit: UnitOfMeasure;
  barcode: string | null;
  unitPrice: number;
  defaultMinQuantity: number;
  description?: string;
}
