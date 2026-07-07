export type TableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'status'
  | 'actions';

export type TableTextAlign =
  | 'left'
  | 'center'
  | 'right';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  type?: TableColumnType;
  sortable?: boolean;
  width?: string;
  align?: TableTextAlign;
  formatter?: (row: T) => string;
}
