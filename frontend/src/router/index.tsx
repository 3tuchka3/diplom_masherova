import React from 'react';
import {createBrowserRouter} from 'react-router-dom'; // Убрали RouteObject отсюда
import type {RouteObject} from 'react-router-dom'; // Добавили специальный импорт типа
import App from '../App';
import Login from '../modules/Login/index';
import Dashboard from '../modules/Dashboard/index'; // Добавь импорт
import CarpetsPage from '../modules/Carpets/index';
import CheckpointPage from '../modules/Checkpoint/index';
import DormitoryPage from "../modules/Dormitory";
import ResidentDetails from "../modules/Dormitory/ResidentDetails";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <Dashboard/> as any,
    },
    {
        path: "/login",
        element: <Login/> as any,
    },
    {
        path: "/carpets",
        element: <CarpetsPage/> as any,
    },
    {
        path: "/checkpoint",
        element: <CheckpointPage/> as any,
    },
    {
        path: "/dormitory",
        element: <DormitoryPage/> as any,
    },
    {
        path: "/dormitory/card/:id",
        element: <ResidentDetails /> as any,
    },

];

export const router = createBrowserRouter(routes);