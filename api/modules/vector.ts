import { request } from '../request';
import { VectorItem, DatabaseItem, TableItem, FieldItem } from '../../types';

export const vectorApi = {
  // List & CRUD
  getList: (params: any) => request.get<{ list: VectorItem[], total: number }>('/vectors', params),
  
  create: (data: any) => request.post<VectorItem>('/vectors', data),
  
  update: (id: string, data: { title: string }) => request.put<VectorItem>(`/vectors/${id}`, data),
  
  batchDelete: (ids: string[]) => request.delete('/vectors', { ids }),
  
  delete: (id: string) => request.delete(`/vectors/${id}`),
  
  toggleStatus: (id: string, isEnabled: boolean) => request.put(`/vectors/${id}/status`, { isEnabled }),
  
  // Validation
  checkName: (title: string) => request.post<{ exists: boolean }>('/vectors/check-name', { title }),
  
  // Sync
  configureSync: (id: string, config: any) => request.post(`/vectors/${id}/sync-config`, config),
  
  // Export
  exportExcel: (ids: string[]) => request.download('/vectors/export', { ids }),
  
  // Wizard / Metadata
  getDatabases: () => request.get<DatabaseItem[]>('/vectors/wizard/databases'),
  
  getTables: (dbId: string) => request.get<TableItem[]>('/vectors/wizard/tables', { dbId }),
  
  getFields: (tableId: string) => request.get<FieldItem[]>('/vectors/wizard/fields', { tableId }),
};

export const searchApi = {
    search: (data: any) => request.post<any[]>('/search/vector', data)
};