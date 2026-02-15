import React, { useEffect, useState, useMemo } from 'react';
import {
    Table, Button, Space, Input, Select, Card,
    Typography, Tag, Row, Col, Modal, InputNumber, App as AntdApp
} from 'antd';
import type { TableProps } from 'antd';
import {
    SearchOutlined, UserAddOutlined, IdcardOutlined,
    SettingOutlined, ArrowLeftOutlined, SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dormitoryApi } from '../../api/dormitory';
import type { IResidentCard, ITariff } from '../../types';

const { Title, Text } = Typography;

const DormitoryPageContent: React.FC = () => {
    const { message } = AntdApp.useApp();
    const navigate = useNavigate();

    const [cards, setCards] = useState<IResidentCard[]>([]);
    const [loading, setLoading] = useState(false);

    // Фильтры
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [searchText, setSearchText] = useState('');

    // Состояния тарифов
    const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
    const [tariffs, setTariffs] = useState<ITariff[]>([]);
    const [tariffsLoading, setTariffsLoading] = useState(false);
    const [savingTariffs, setSavingTariffs] = useState(false);

    // 1. Загружаем данные.
    // Убираем [selectedYear] из зависимостей useEffect, чтобы загрузить ВСЕХ жильцов один раз,
    // либо оставляем, если бэкенд строго фильтрует на своей стороне.
    // Оставим загрузку при смене года, но добавим сбор ВСЕХ годов.
    const fetchCards = async () => {
        setLoading(true);
        try {
            // Явно передаем null или undefined, чтобы бэк не фильтровал
            const res = await dormitoryApi.getCards(undefined);

            // Если у тебя включена пагинация на бэкенде (DRF),
            // по умолчанию может приходить только 10-20 записей.
            // Проверь, нет ли в ответе поля 'count' или 'next'
            const data = Array.isArray(res.data) ? res.data : (res.data as any).results;

            console.log("ПОЛУЧЕНО КАРТОЧЕК С СЕРВЕРА:", data.length);
            console.log("ВСЕ ГОДА В ДАННЫХ:", data.map((c: any) => c.year));

            setCards(data || []);
        } catch (e) {
            message.error("Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    const fetchTariffs = async () => {
        setTariffsLoading(true);
        try {
            const res = await dormitoryApi.getTariffs();
            setTariffs(res.data);
        } catch (e) {
            message.error("Ошибка при загрузке тарифов");
        } finally {
            setTariffsLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []); // Загружаем один раз при старте

    // 2. ДИНАМИЧЕСКИЙ ФИЛЬТР ГОДОВ (теперь он видит все года из всех загруженных карточек)
    const availableYears = useMemo(() => {
        // Вытаскиваем все года, которые реально есть в пришедших данных
        const yearsInData = cards.map(c => c.year);

        // Создаем массив лет от 2024 до 2030, чтобы они ВСЕГДА были в фильтре
        const defaultYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

        const allUniqueYears = Array.from(new Set([...yearsInData, ...defaultYears]))
            .filter(y => y >= 2020)
            .sort((a, b) => b - a);

        return allUniqueYears.map(y => ({ value: y, label: `${y} год` }));
    }, [cards]);

    // 3. ЛОКАЛЬНАЯ ФИЛЬТРАЦИЯ И ПОИСК (работает мгновенно)
    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesYear = selectedYear ? card.year === selectedYear : true;
            const matchesSearch =
                card.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                card.account_number.toLowerCase().includes(searchText.toLowerCase());

            return matchesYear && matchesSearch;
        });
    }, [cards, selectedYear, searchText]);

    const handleSaveAllTariffs = async () => {
        setSavingTariffs(true);
        try {
            await Promise.all(tariffs.map(t => dormitoryApi.updateTariff(t.id, t.value)));
            message.success("Тарифы обновлены");
            setIsTariffModalOpen(false);
            fetchCards();
        } catch (e) {
            message.error("Ошибка сохранения");
        } finally {
            setSavingTariffs(false);
        }
    };

    const columns: TableProps<IResidentCard>['columns'] = [
        {
            title: 'Лицевой счет',
            dataIndex: 'account_number',
            key: 'account_number',
            width: 150,
            render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
        },
        {
            title: 'ФИО Жильца',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => <Text style={{ color: '#fff' }}>{text}</Text>
        },
        {
            title: 'Комната',
            dataIndex: 'room_number',
            key: 'room_number',
            align: 'center',
            width: 100,
            render: (text) => <Tag color="blue">№ {text}</Tag>
        },
        {
            title: 'Год',
            dataIndex: 'year',
            key: 'year',
            align: 'center',
            width: 100,
            render: (year) => <Tag color="orange">{year}</Tag>
        },
        {
            title: 'Итого начислено',
            key: 'total_year',
            align: 'right',
            width: 180,
            render: (_, record) => {
                const total = (record.payments || []).reduce((sum, p: any) => {
                    return sum + Object.keys(p).reduce((acc, key) => {
                        return (typeof p[key] === 'number' && !['id', 'month', 'card'].includes(key))
                            ? acc + p[key]
                            : acc;
                    }, 0);
                }, 0);
                return <Text style={{ color: '#52c41a' }} strong>{total.toFixed(2)} р.</Text>
            }
        },
        {
            title: 'Действие',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    icon={<IdcardOutlined />}
                    onClick={() => navigate(`/dormitory/card/${record.id}`)}
                >
                    Карточка
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#000' }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="large">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text" style={{ color: '#8c8c8c' }}>Меню</Button>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>Журнал жилого фонда</Title>
                </Space>
                <Space>
                    <Button icon={<SettingOutlined />} onClick={() => { setIsTariffModalOpen(true); fetchTariffs(); }} style={{ background: 'transparent', color: '#fff' }}>Тарифы</Button>
                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/dormitory/card/new')} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Новое заселение</Button>
                </Space>
            </div>

            <Card style={{ marginBottom: 24, background: '#141414', border: '1px solid #303030' }}>
                <Row gutter={24}>
                    <Col xs={24} md={6}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Фильтр по году</Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Все годы"
                            allowClear
                            value={selectedYear}
                            onChange={setSelectedYear}
                            options={[
                                { value: undefined, label: 'Все годы' },
                                ...availableYears
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={18}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Поиск</Text>
                        <Input
                            placeholder="ФИО или Лицевой счет..."
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={e => setSearchText(e.target.value)}
                            style={{ background: '#000', color: '#fff', borderColor: '#303030' }}
                        />
                    </Col>
                </Row>
            </Card>

            <div style={{ background: '#141414', border: '1px solid #303030', borderRadius: '8px' }}>
                <Table
                    dataSource={filteredCards}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ position: ['bottomCenter'], pageSize: 10 }}
                />
            </div>

            <Modal
                title="Тарифы"
                open={isTariffModalOpen}
                onCancel={() => setIsTariffModalOpen(false)}
                onOk={handleSaveAllTariffs}
                confirmLoading={savingTariffs}
                width={600}
            >
                <Table
                    dataSource={tariffs}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                        { title: 'Услуга', dataIndex: 'label' },
                        { title: 'Цена', dataIndex: 'value', render: (val, record) => (
                            <InputNumber value={val} onChange={v => setTariffs(prev => prev.map(t => t.id === record.id ? {...t, value: Number(v)||0} : t))} />
                        )}
                    ]}
                />
            </Modal>
        </div>
    );
};

const DormitoryPage: React.FC = () => (
    <AntdApp>
        <DormitoryPageContent />
    </AntdApp>
);

export default DormitoryPage;