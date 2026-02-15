// src/api/index.ts
import axios from 'axios';

// Базовый URL твоего Django
const BASE_URL = 'http://127.0.0.1:8000/api/';

// Создаем "экземпляр" axios с настройками
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ПЕРЕХВАТЧИК (Interceptor) запросов
// Перед тем как запрос улетит на сервер, мы проверяем, есть ли токен в кармане (localStorage)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // Если токен есть, цепляем его в заголовок: Authorization: Bearer <token>
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});