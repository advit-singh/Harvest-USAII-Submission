export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiError;
}

export interface PaginatedMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}
