import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { api } from '../../api';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Убедись, что на бэкенде путь именно такой
            const response = await api.post('accounts/login/', values);

            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);

            message.success('Вход выполнен успешно!');
            window.location.href = '/';
        } catch (error: any) {
            console.error(error);
            message.error('Ошибка входа: проверьте логин/пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>Система управления</Title>
                    <p>Введите ваши данные для входа</p>
                </div>

                <Form name="login_form" onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Введите логин!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;