import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index'
import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#177ddc',
          colorBgBase: '#141414',
          borderRadius: 6,
        },
      }}
    >
      {/* Глобальный стиль для темного фона страницы */}
      <style>
        {`
          body { background-color: #141414 !important; margin: 0; }
          .ant-layout { background: #141414 !important; }
        `}
      </style>
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>
)