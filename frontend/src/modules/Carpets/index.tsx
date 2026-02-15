import React, { useEffect, useState } from 'react';
import { Image, Input, Typography, Card, Select, Row, Col, Pagination, Button, Space } from 'antd';
import { SearchOutlined, ShopOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { carpetsApi } from '../../api/carpets';
import type { ICarpet } from '../../types/index';

const { Title, Text } = Typography;

const CarpetsPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<ICarpet[]>([]);
    const [loading, setLoading] = useState(false);

    // Фильтры
    const [searchText, setSearchText] = useState('');
    const [fDesign, setFDesign] = useState<string | null>(null);
    const [fColor, setFColor] = useState<string | null>(null);
    const [fPalette, setFPalette] = useState<string | null>(null);
    const [fSize, setFSize] = useState<string | null>(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => {
        fetchCarpets();
    }, []);

    const fetchCarpets = async () => {
        setLoading(true);
        try {
            const res = await carpetsApi.getAll();
            // Обработка данных с учетом возможной пагинации на бэкенде
            const result = Array.isArray(res.data) ? res.data : (res.data as any).results;
            setData(result || []);
        } catch (e) {
            console.error("Ошибка при загрузке данных:", e);
        } finally {
            setLoading(false);
        }
    };

    // Логика фильтрации
    const filteredData = data.filter(item => {
        const matchesSearch = (item.design + item.color).toLowerCase().includes(searchText.toLowerCase());
        const matchesDesign = fDesign ? item.design === fDesign : true;
        const matchesColor = fColor ? item.color === fColor : true;
        const matchesPalette = fPalette ? item.palette === fPalette : true;
        const matchesSize = fSize ? item.size === fSize : true;
        return matchesSearch && matchesDesign && matchesColor && matchesPalette && matchesSize;
    });

    // Расчет отображаемых элементов
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Вспомогательная функция для уникальных значений в Select
    const getUnique = (field: keyof ICarpet) =>
        Array.from(new Set(data.map(item => String(item[field])) || [])).sort();

    return (
        <div style={{ padding: '24px' }}>
            {/* Хедер страницы */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="large">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/')}
                        type="text"
                        style={{ color: '#fff' }}
                    >
                        В меню
                    </Button>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>
                        <ShopOutlined /> Склад ковров
                    </Title>
                </Space>
            </div>

            {/* Панель инструментов */}
            <div style={{ marginBottom: 24 }}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} lg={6}>
                        <Input
                            placeholder="Поиск по рисунку или колориту..."
                            prefix={<SearchOutlined />}
                            onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} lg={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Рисунок"
                            allowClear
                            onChange={(v) => {setFDesign(v); setCurrentPage(1);}}
                            options={getUnique('design').map(v => ({ label: v, value: v }))}
                        />
                    </Col>
                    <Col xs={12} lg={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Колорит"
                            allowClear
                            onChange={(v) => {setFColor(v); setCurrentPage(1);}}
                            options={getUnique('color').map(v => ({ label: v, value: v }))}
                        />
                    </Col>
                    <Col xs={12} lg={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Палитра"
                            allowClear
                            onChange={(v) => {setFPalette(v); setCurrentPage(1);}}
                            options={getUnique('palette').map(v => ({ label: v, value: v }))}
                        />
                    </Col>
                    <Col xs={12} lg={6}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Размер"
                            allowClear
                            onChange={(v) => {setFSize(v); setCurrentPage(1);}}
                            options={getUnique('size').map(v => ({ label: v, value: v }))}
                        />
                    </Col>
                </Row>
            </div>

            {/* Сетка карточек */}
            <Row gutter={[16, 24]}>
                {currentItems.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={item.id}>
                        <Card
                            hoverable
                            loading={loading}
                            cover={
                                <Image
                                    alt={item.design}
                                    src={item.image_url}
                                    style={{ height: 350, objectFit: 'cover' }}
                                    fallback="https://via.placeholder.com/300x400?text=No+Image"
                                />
                            }
                            styles={{ body: { padding: '12px', textAlign: 'center' } }}
                        >
                            <Text strong style={{ fontSize: '15px', color: '#fff' }}>
                                {`${item.design} ${item.color} ${item.palette} ${item.size}`}
                            </Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Подвал с пагинацией */}
            <div style={{ marginTop: 32, textAlign: 'center', paddingBottom: 40 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredData.length}
                    onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                    showSizeChanger
                    pageSizeOptions={['12', '24', '48', '100']}
                />
            </div>
        </div>
    );
};

export default CarpetsPage;