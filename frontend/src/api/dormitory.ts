import {api} from './index';
// Добавляем ключевое слово 'type' — это критично для Vite при возникновении таких ошибок
import type {IResidentCard, ITariff} from '../types';
import axios from 'axios'; // Добавь эту строку в самый верх

export const dormitoryApi = {
    getCards: (year?: number) =>
        api.get<IResidentCard[]>('dormitory/cards/', {params: {year}}),

    getCardById: (id: number) =>
        api.get<IResidentCard>(`dormitory/cards/${id}/`),

    createCard: (data: Partial<IResidentCard>) =>
        api.post<IResidentCard>('dormitory/cards/', data),

    updateCard: (id: number, data: Partial<IResidentCard>) =>
        api.patch<IResidentCard>(`dormitory/cards/${id}/`, data),

    getTariffs: () =>
        api.get<ITariff[]>('dormitory/tariffs/'),

    updateTariff: (id: number, value: number) =>
        api.patch<ITariff>(`dormitory/tariffs/${id}/`, {value}),

    deleteCard: (id: number) => axios.delete(`/api/dormitory/cards/${id}/`),

};