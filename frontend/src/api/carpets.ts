import { api } from './index';
import type { ICarpet } from '../types/index';

export const carpetsApi = {
    getAll: () => api.get<ICarpet[]>('carpets/items/'),
    getOne: (id: number) => api.get<ICarpet>(`carpets/items/${id}/`),
    create: (data: any) => api.post('carpets/items/', data),
};