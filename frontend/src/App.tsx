import React from 'react';
import { Outlet } from 'react-router-dom';
import { App as AntdApp, ConfigProvider, theme } from 'antd'; // Импортируем App из antd

const App: React.FC = () => {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      {/* Обязательно оборачиваем Outlet в AntdApp */}
      <AntdApp>
        <div className="app-container">
          <Outlet />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;