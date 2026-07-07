export interface MockApiErrorBody {
  success: false;
  message: string;
  code: string;
  timestamp: string;
  details?: unknown;
}

export interface MockApiSuccessBody<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
