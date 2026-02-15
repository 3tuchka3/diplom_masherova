import React from 'react';
import { Card, Col, Row, Typography, Layout, Button } from 'antd';
// Исправлено: ShopOutlined с большой буквы
import { CarOutlined, HomeOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { IUser } from '../../types'; // Добавлено type для Vite

const { Title } = Typography;
const { Content, Header } = Layout;

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    console.log("1. Токен из памяти:", token); // Посмотрим, есть ли он вообще

    let user: IUser | null = null;
    if (token) {
        try {
            user = jwtDecode<IUser>(token);
            console.log("2. Декодированный юзер:", user); // Посмотрим, что внутри
        } catch (e) {
            console.error("3. Ошибка декодирования:", e);
        }
    }

    if (!token || !user) {
        // Если что-то не так, мягко редиректим
        setTimeout(() => navigate('/login'), 0);
        return null;
    }

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const modules = [
        {
            title: 'КПП',
            icon: <CarOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
            path: '/checkpoint',
            // Проверка: увидит, если есть роль ИЛИ если он суперпользователь
            show: user.is_checkpoint_officer || user.username === 'admin',
            description: 'Учет въезда и выезда транспорта'
        },
        {
            title: 'Общежитие',
            icon: <HomeOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
            path: '/dormitory',
            show: user.is_dorm_manager || user.username === 'admin',
            description: 'Жильцы и коммунальные платежи'
        },
        {
            title: 'Склад ковров',
            icon: <ShopOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
            path: '/carpets',
            show: user.is_carpet_admin || user.username === 'admin',
            description: 'Каталог изделий и инвентаризация'
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 20px' }}>
                <Title level={4} style={{ margin: 0 }}>Система управления</Title>
                <Button icon={<LogoutOutlined />} onClick={handleLogout}>Выйти ({user.username})</Button>
            </Header>
            <Content style={{ padding: '40px' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <Title level={2}>Панель управления</Title>
                    <Typography.Text type="secondary">Доступные вам модули системы</Typography.Text>
                </div>

                <Row gutter={[24, 24]} justify="center">
                    {modules.map((mod) => mod.show && (
                        <Col xs={24} sm={12} md={8} key={mod.path}>
                            <Card
                                hoverable
                                style={{ textAlign: 'center', borderRadius: '12px', height: '100%' }}
                                onClick={() => navigate(mod.path)}
                            >
                                <div style={{ marginBottom: '16px' }}>{mod.icon}</div>
                                <Card.Meta title={mod.title} description={mod.description} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>
        </Layout>
    );
};

export default Dashboard;