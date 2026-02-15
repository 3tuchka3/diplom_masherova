import React, { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Space, Typography,
    Tabs, Modal, Form, Input, Upload, Divider, Descriptions, Image, Card, Col, Row, Empty
} from 'antd';
import type { UploadFile } from 'antd';
import {
    ArrowLeftOutlined, LoginOutlined, LogoutOutlined,
    EyeOutlined, UploadOutlined, FilePdfOutlined, PictureOutlined, SearchOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { checkpointApi } from '../../api/checkpoint';
import type { IVehicleRecord } from '../../types/index';

const { Title, Text } = Typography;

const CheckpointPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();

    const [data, setData] = useState<IVehicleRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<IVehicleRecord | null>(null);

    const [photoList, setPhotoList] = useState<UploadFile[]>([]);
    const [docList, setDocList] = useState<UploadFile[]>([]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await checkpointApi.getAll();
            const result = Array.isArray(res.data) ? res.data : (res.data as any).results;
            setData(result || []);
        } catch (e) {
            console.error("Ошибка загрузки:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    const onFinishRegistration = async (values: any) => {
        const isAlreadyInside = data.some(item =>
            item.car_number.toLowerCase() === values.car_number.toLowerCase() && !item.exit_time
        );

        if (isAlreadyInside) {
            modal.warning({
                title: 'Транспорт уже в системе',
                content: `Автомобиль ${values.car_number.toUpperCase()} еще не покинул территорию.`
            });
            return;
        }

        setConfirmLoading(true);
        const formData = new FormData();
        formData.append('car_number', values.car_number);
        formData.append('car_brand', values.car_brand);
        formData.append('driver_name', values.driver_name);
        formData.append('organization', values.organization || '');

        photoList.forEach((file) => {
            if (file.originFileObj) formData.append('photos', file.originFileObj as any);
        });
        docList.forEach((file) => {
            if (file.originFileObj) formData.append('documents', file.originFileObj as any);
        });

        try {
            await checkpointApi.create(formData);
            modal.success({ title: "Успешно", content: "Въезд зафиксирован" });
            setIsRegisterOpen(false);
            form.resetFields();
            setPhotoList([]);
            setDocList([]);
            fetchRecords();
        } catch (e) {
            modal.error({ title: "Ошибка", content: "Ошибка при сохранении данных." });
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleExit = async (id: number) => {
        try {
            await checkpointApi.setExit(id);
            fetchRecords();
        } catch (e) {
            modal.error({ title: "Ошибка", content: "Не удалось зафиксировать выезд" });
        }
    };

    const filteredData = data.filter(item =>
        (item.car_number?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (item.driver_name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (item.organization?.toLowerCase() || '').includes(searchText.toLowerCase())
    );

    const onTerritoryData = filteredData.filter(i => !i.exit_time);

    // Колонки Журнала событий
    const logColumns = [
        {
            title: 'Событие',
            key: 'event_time',
            width: 120,
            render: (_, record: IVehicleRecord) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong>{dayjs(record.entry_time).format('HH:mm')}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{dayjs(record.entry_time).format('DD.MM.YY')}</Text>
                </div>
            )
        },
        {
            title: 'Гос. номер',
            dataIndex: 'car_number',
            key: 'car_number',
            render: (text: string) => <Tag color="blue" style={{ fontWeight: 'bold' }}>{text?.toUpperCase()}</Tag>
        },
        { title: 'Марка', dataIndex: 'car_brand', key: 'car_brand' },
        { title: 'Водитель', dataIndex: 'driver_name', key: 'driver_name' },
        { title: 'Организация', dataIndex: 'organization', key: 'organization', render: (val: string) => val || '—' },
        {
            title: 'Файлы',
            key: 'files',
            render: (_, record: IVehicleRecord) => (
                <Space>
                    {record.photos?.length > 0 && <PictureOutlined style={{ color: '#52c41a' }} title="Фото" />}
                    {record.documents?.length > 0 && <FilePdfOutlined style={{ color: '#ff4d4f' }} title="Документы" />}
                    {(record.photos?.length === 0 && record.documents?.length === 0) && <Text type="secondary">—</Text>}
                </Space>
            )
        },
        {
            title: 'Статус',
            key: 'status',
            render: (_, record: IVehicleRecord) => (
                record.exit_time
                ? <Tag color="default">ВЫЕХАЛ {dayjs(record.exit_time).format('HH:mm')}</Tag>
                : <Tag color="green">НА ТЕРРИТОРИИ</Tag>
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record: IVehicleRecord) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedRecord(record); setIsViewOpen(true); }} />
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            {contextHolder}

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="large">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text" style={{ color: '#fff' }}>В меню</Button>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>КПП: Контроль транспорта</Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Поиск..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Button type="primary" icon={<LoginOutlined />} onClick={() => setIsRegisterOpen(true)} size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                        Регистрация въезда
                    </Button>
                </Space>
            </div>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: `На территории (${onTerritoryData.length})`,
                    children: (
                        <div style={{ minHeight: '400px', paddingTop: '10px' }}>
                            {onTerritoryData.length > 0 ? (
                                <Row gutter={[16, 16]}>
                                    {onTerritoryData.map(record => (
                                        <Col key={record.id} xs={24} sm={12} md={8} lg={6}>
                                            <Card
                                                hoverable
                                                size="small"
                                                style={{ borderTop: '3px solid #52c41a' }}
                                                actions={[
                                                    <EyeOutlined key="view" onClick={() => { setSelectedRecord(record); setIsViewOpen(true); }} />,
                                                    <Button
                                                        type="link"
                                                        danger
                                                        size="small"
                                                        icon={<LogoutOutlined />}
                                                        onClick={() => handleExit(record.id)}
                                                    >
                                                        ВЫПУСТИТЬ
                                                    </Button>
                                                ]}
                                            >
                                                <Card.Meta
                                                    title={<Tag color="blue">{record.car_number.toUpperCase()}</Tag>}
                                                    description={
                                                        <div style={{ marginTop: 10 }}>
                                                            <div style={{ marginBottom: 4 }}><Text strong>{record.car_brand}</Text></div>
                                                            <div style={{ marginBottom: 4 }}><Text type="secondary">{record.driver_name}</Text></div>
                                                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                                <ClockCircleOutlined /> Въезд: {dayjs(record.entry_time).format('HH:mm')}
                                                            </div>
                                                            {record.organization && <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 4 }}>🏢 {record.organization}</div>}
                                                        </div>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : <Empty description="На территории пусто" style={{ marginTop: 80 }} /> }
                        </div>
                    )
                },
                {
                    key: '2',
                    label: 'Журнал событий',
                    children: <Table dataSource={filteredData} columns={logColumns} rowKey="id" loading={loading} pagination={{ pageSize: 10 } as any} size="middle" />
                }
            ]} />

            <Modal title="Регистрация въезда" open={isRegisterOpen} onCancel={() => !confirmLoading && setIsRegisterOpen(false)} onOk={() => form.submit()} confirmLoading={confirmLoading} width={600}>
                <Form form={form} layout="vertical" onFinish={onFinishRegistration} style={{ marginTop: 15 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="car_number" label="Гос. номер" rules={[{ required: true }]}><Input placeholder="А000АА00" /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="car_brand" label="Марка авто" rules={[{ required: true }]}><Input placeholder="ГАЗель, КамАЗ..." /></Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="driver_name" label="ФИО водителя" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="organization" label="Организация (Поставщик/Получатель)"><Input /></Form.Item>
                    <Divider titlePlacement="left">Вложения</Divider>
                    <Space size="large">
                        <Upload listType="picture-card" fileList={photoList} onChange={({ fileList }) => setPhotoList(fileList)} beforeUpload={() => false}>
                            <div><UploadOutlined /><div>Фото</div></div>
                        </Upload>
                        <Upload fileList={docList} onChange={({ fileList }) => setDocList(fileList)} beforeUpload={() => false}>
                            <Button icon={<FilePdfOutlined />}>PDF документ</Button>
                        </Upload>
                    </Space>
                </Form>
            </Modal>

            <Modal title="Детали записи" open={isViewOpen} onCancel={() => setIsViewOpen(false)} footer={null} width={800}>
                {selectedRecord && (
                    <div style={{ marginTop: 15 }}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Гос. номер"><Tag color="blue">{selectedRecord.car_number}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Марка">{selectedRecord.car_brand}</Descriptions.Item>
                            <Descriptions.Item label="Водитель">{selectedRecord.driver_name}</Descriptions.Item>
                            <Descriptions.Item label="Организация">{selectedRecord.organization || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Въезд">{dayjs(selectedRecord.entry_time).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
                            <Descriptions.Item label="Выезд">{selectedRecord.exit_time ? dayjs(selectedRecord.exit_time).format('DD.MM.YYYY HH:mm') : '—'}</Descriptions.Item>
                        </Descriptions>
                        <Divider titlePlacement="left">Фото</Divider>
                        <Image.PreviewGroup>
                            <Space wrap>{selectedRecord.photos?.map(p => <Image key={p.id} src={p.image} width={140} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} />)}</Space>
                        </Image.PreviewGroup>
                        <Divider titlePlacement="left">Документы</Divider>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {selectedRecord.documents?.map((doc, idx) => (
                                <Button key={idx} type="link" icon={<FilePdfOutlined />} href={doc.file} target="_blank" style={{ textAlign: 'left', width: 'fit-content' }}>
                                    Открыть документ #{idx + 1}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CheckpointPage;