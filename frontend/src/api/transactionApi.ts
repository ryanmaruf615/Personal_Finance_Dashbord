import api from './axiosConfig';
import {
  TransactionRequest,
  TransactionResponse,
  TransactionFilters,
  PageResponse,
  CsvPreviewResponse,
  CsvImportResultResponse,
} from '../types/transaction';

export const transactionApi = {
  getAll: async (
    filters: TransactionFilters = {}
  ): Promise<PageResponse<TransactionResponse>> => {
    const params: Record<string, string | number> = {};

    if (filters.accountId) params.accountId = filters.accountId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.type) params.type = filters.type;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size) params.size = filters.size;
    if (filters.sort) params.sort = filters.sort;

    const response = await api.get<PageResponse<TransactionResponse>>(
      '/api/transactions',
      { params }
    );
    return response.data;
  },

  getById: async (id: number): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>(
      `/api/transactions/${id}`
    );
    return response.data;
  },

  create: async (data: TransactionRequest): Promise<TransactionResponse> => {
    const response = await api.post<TransactionResponse>(
      '/api/transactions',
      data
    );
    return response.data;
  },

  update: async (
    id: number,
    data: TransactionRequest
  ): Promise<TransactionResponse> => {
    const response = await api.put<TransactionResponse>(
      `/api/transactions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },

  // ─── CSV Import ─────────────────────────────────────────────────

  previewCsv: async (file: File): Promise<CsvPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<CsvPreviewResponse>(
      '/api/transactions/import/preview',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  importCsv: async (
    file: File,
    accountId: number
  ): Promise<CsvImportResultResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<CsvImportResultResponse>(
      '/api/transactions/import/confirm',
      formData,
      {
        params: { accountId },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};
