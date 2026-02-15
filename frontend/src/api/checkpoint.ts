import { api } from './index';
import type { IVehicleRecord } from '../types/index';

export const checkpointApi = {
    // Получение всех записей (Журнал)
    getAll: () => api.get<IVehicleRecord[]>('checkpoint/records/'),

    // Детальная информация по ID
    getOne: (id: number) => api.get<IVehicleRecord>(`checkpoint/records/${id}/`),

    // Метод для кнопки "Выпустить" (твой @action exit в Django)
    setExit: (id: number) => api.post(`checkpoint/records/${id}/exit/`),

    // Создание новой записи (для формы регистрации)
    create: (data: FormData) => api.post('checkpoint/records/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};