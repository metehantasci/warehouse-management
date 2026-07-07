export type SortDirection = 'asc' | 'desc';

export interface QueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  filters?: Record<string, string | number | boolean | null>;
}
