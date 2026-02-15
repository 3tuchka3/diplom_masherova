import React, {useEffect, useState, useMemo, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Card, Typography, Table, Button, Space,
    Tag, Spin, InputNumber, Input, Modal, Descriptions,
    Row, Col, message, Select
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    EditOutlined,
    PrinterOutlined,
    DeleteOutlined // Проверь, чтобы это слово было здесь!
} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {useReactToPrint} from 'react-to-print';
import {dormitoryApi} from '../../api/dormitory';
import type {IResidentCard, ITariff, IMonthlyPayment} from '../../types';
import NoticePrint from './NoticePrint';

const {Title, Text} = Typography;

const MONTHS_LABELS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const ResidentDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [resident, setResident] = useState<IResidentCard | null>(null);
    const [tariffs, setTariffs] = useState<ITariff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(isNew);
    const [editData, setEditData] = useState<Partial<IResidentCard>>({});

    // Печать
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMonth, setPrintMonth] = useState<number>(new Date().getMonth() + 1);
    // 1. Создаем реф с явным указанием типа или null
    // 1. В начале компонента: принудительно кастуем null к нужному типу через any
    const printRef = useRef<HTMLDivElement>(null as any);

// 2. Настройка печати
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Notice_${resident?.account_number || 'print'}`,
    });

    const createEmptyPayments = (tariffsList: ITariff[]): IMonthlyPayment[] => {
        return Array.from({length: 12}, (_, i) => {
            const monthObj: any = {month: i + 1, recalculation: 0};
            tariffsList.forEach(t => {
                monthObj[t.service_name] = 0;
            });
            return monthObj as IMonthlyPayment;
        });
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Удаление карточки',
            content: `Вы уверены, что хотите удалить карточку ${resident?.full_name}? Это действие необратимо.`,
            okText: 'Да, удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk: async () => {
                try {
                    await dormitoryApi.deleteCard(Number(id));
                    message.success('Карточка удалена');
                    navigate('/dormitory'); // Возвращаемся к списку
                } catch (e) {
                    message.error('Ошибка при удалении');
                }
            },
        });
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const resTariffs = await dormitoryApi.getTariffs();
            const currentTariffs = resTariffs.data;
            setTariffs(currentTariffs);

            if (isNew) {
                const initialData: IResidentCard = {
                    id: 0, full_name: '', account_number: '', room_number: '',
                    year: 2026, total_area: 0, living_area: 0,
                    family_count: 1, dog_count: 0,
                    payments: createEmptyPayments(currentTariffs)
                };
                setResident(initialData);
                setEditData(initialData);
            } else {
                const resCard = await dormitoryApi.getCardById(Number(id));
                const existingPayments = resCard.data.payments || [];
                const fullPayments = createEmptyPayments(currentTariffs).map(emptyMonth => {
                    const found = existingPayments.find((p: any) => Number(p.month) === emptyMonth.month);
                    return found ? {...emptyMonth, ...found} : emptyMonth;
                });
                setResident({...resCard.data, payments: fullPayments});
            }
        } catch (e) {
            console.error("Fetch error:", e);
            message.error("Ошибка при загрузке данных");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCellChange = (monthNum: number, serviceName: string, value: number | null) => {
        if (!resident || !resident.payments) return;
        const updatedPayments = resident.payments.map(p =>
            Number(p.month) === monthNum ? {...p, [serviceName]: value ?? 0} : p
        );
        setResident({...resident, payments: updatedPayments});
    };

    const handleSaveAll = async () => {
        if (!resident) return;
        if (!resident.full_name || !resident.account_number) {
            message.warning("Заполните ФИО и Лицевой счет");
            setIsEditHeaderOpen(true);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                full_name: String(resident.full_name).trim(),
                account_number: String(resident.account_number).trim(),
                room_number: String(resident.room_number || "0"),
                year: Math.floor(Number(resident.year)),
                total_area: Number(resident.total_area || 0),
                living_area: Number(resident.living_area || 0),
                family_count: Number(resident.family_count || 1),
                dog_count: Number(resident.dog_count || 0),
                payments: (resident.payments || []).map((p: any) => {
                    const cleanP: any = {month: Number(p.month), recalculation: Number(p.recalculation || 0)};
                    tariffs.forEach(t => {
                        cleanP[t.service_name] = Number(p[t.service_name] || 0);
                    });
                    return cleanP;
                })
            };

            if (isNew) {
                const res = await dormitoryApi.createCard(payload as any);
                message.success("Карточка успешно создана");
                navigate(`/dormitory/card/${res.data.id}`, {replace: true});
            } else {
                await dormitoryApi.updateCard(Number(id), payload as any);
                message.success("Данные сохранены");
                fetchData();
            }
        } catch (e: any) {
            message.error("Не удалось сохранить данные.");
        } finally {
            setSaving(false);
        }
    };

    const columns: ColumnsType<ITariff> = useMemo(() => [
        {
            title: 'Услуга',
            dataIndex: 'label',
            key: 'service_label',
            fixed: 'left',
            width: 180,
            render: (val) => <Text style={{color: '#aaa'}}>{val}</Text>
        },
        ...MONTHS_LABELS.map((label, index) => {
            const mNum = index + 1;
            return {
                title: label,
                key: `month_${mNum}`,
                align: 'center' as const,
                width: 90,
                render: (_: any, record: ITariff) => {
                    const p = (resident?.payments || []).find((pay: any) => Number(pay.month) === mNum);
                    const val = p ? (p as any)[record.service_name] : 0;
                    return (
                        <InputNumber
                            value={val}
                            size="small"
                            controls={false}
                            variant="borderless"
                            style={{width: '100%', textAlign: 'center', color: '#fff'}}
                            onChange={(v) => handleCellChange(mNum, record.service_name, v !== null ? Number(v) : 0)}
                        />
                    );
                }
            };
        }),
        {
            title: 'Итого',
            key: 'total_row',
            fixed: 'right',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const total = (resident?.payments || []).reduce(
                    (sum, p: any) => sum + Number(p[record.service_name] || 0), 0
                );
                return <Text style={{color: '#52c41a', fontWeight: 'bold'}}>{total.toFixed(2)}</Text>;
            }
        }
    ], [resident, tariffs]);

    if (loading) return <div style={{padding: 100, textAlign: 'center'}}><Spin size="large"/></div>;

    return (
        <div style={{padding: '24px', background: '#000', minHeight: '100vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 24}}>
                <Space>
                    {/* Эта кнопка возвращает в журнал */}
                    <Button
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => navigate('/dormitory')}
                        type="text"
                        style={{color: '#fff'}}
                    />
                    <Title level={3} style={{color: '#fff', margin: 0}}>
                        {isNew ? "Новое заселение" : `${resident?.full_name}`}
                    </Title>
                </Space>

                <Space>
                    {!isNew && (
                        <>
                            <Button
                                danger
                                icon={<DeleteOutlined/>}
                                onClick={handleDelete}
                                loading={saving}
                            >
                                Удалить
                            </Button>
                            <Button
                                icon={<PrinterOutlined/>}
                                onClick={() => setIsPrintModalOpen(true)}
                            >
                                Извещение
                            </Button>
                        </>
                    )}
                    <Button type="primary" icon={<SaveOutlined/>} onClick={handleSaveAll} loading={saving}>
                        {isNew ? "Создать" : "Сохранить"}
                    </Button>
                </Space>
            </div>

            <Card style={{background: '#141414', border: '1px solid #303030', marginBottom: 24}}>
                <Descriptions bordered size="small" column={{xxl: 4, xl: 4, lg: 2, md: 1}} styles={{
                    content: {color: '#fff', background: '#1d1d1d'},
                    label: {color: '#aaa', background: '#141414', fontWeight: 'bold'}
                }}>
                    <Descriptions.Item label="Л/С">{resident?.account_number}</Descriptions.Item>
                    <Descriptions.Item label="Год"><Tag color="gold">{resident?.year}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Комната">№ {resident?.room_number}</Descriptions.Item>
                    <Descriptions.Item
                        label="Площадь">{resident?.total_area} / {resident?.living_area} м²</Descriptions.Item>
                    <Descriptions.Item label="Семья">{resident?.family_count} чел.</Descriptions.Item>
                    <Descriptions.Item label="Собаки">{resident?.dog_count}</Descriptions.Item>
                    <Descriptions.Item label="Управление" span={2}>
                        <Button type="link" icon={<EditOutlined/>} onClick={() => {
                            setEditData(resident || {});
                            setIsEditHeaderOpen(true);
                        }}>
                            Изменить параметры
                        </Button>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Table
                dataSource={tariffs}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{x: 1500}}
                bordered
                size="small"
                summary={() => (
                    <Table.Summary fixed="bottom">
                        <Table.Summary.Row style={{background: '#141414'}}>
                            <Table.Summary.Cell index={0}><Text strong
                                                                style={{color: '#fff'}}>ИТОГО:</Text></Table.Summary.Cell>
                            {MONTHS_LABELS.map((_, i) => {
                                const mNum = i + 1;
                                const p = (resident?.payments || []).find((pay: any) => Number(pay.month) === mNum);
                                const monthTotal = tariffs.reduce((s, t) => s + Number((p as any)?.[t.service_name] || 0), 0);
                                return (
                                    <Table.Summary.Cell index={i + 1} key={i} align="center">
                                        <Text strong style={{color: '#1890ff'}}>{monthTotal.toFixed(2)}</Text>
                                    </Table.Summary.Cell>
                                );
                            })}
                            <Table.Summary.Cell index={13} align="center">
                                <Text strong style={{color: '#52c41a'}}>
                                    {(resident?.payments || []).reduce((acc, p) =>
                                        acc + tariffs.reduce((s, t) => s + Number((p as any)[t.service_name] || 0), 0), 0
                                    ).toFixed(2)}
                                </Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            {/* Модалка изменения параметров */}
            <Modal
                title="Параметры жильца"
                open={isEditHeaderOpen}
                onCancel={() => isNew ? navigate('/dormitory') : setIsEditHeaderOpen(false)}
                onOk={() => {
                    if (resident && editData) {
                        setResident({...resident, ...editData} as IResidentCard);
                    }
                    setIsEditHeaderOpen(false);
                }}
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10}}>
                    <Input placeholder="ФИО" value={editData.full_name || ''}
                           onChange={e => setEditData(prev => ({...prev, full_name: e.target.value}))}/>
                    <Row gutter={16}>
                        <Col span={12}><Input placeholder="Л/С" value={editData.account_number || ''}
                                              onChange={e => setEditData(prev => ({
                                                  ...prev,
                                                  account_number: e.target.value
                                              }))}/></Col>
                        <Col span={12}><Input placeholder="Комната" value={editData.room_number || ''}
                                              onChange={e => setEditData(prev => ({
                                                  ...prev,
                                                  room_number: e.target.value
                                              }))}/></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}><Text type="secondary">Общая пл.</Text><InputNumber style={{width: '100%'}}
                                                                                           value={editData.total_area}
                                                                                           onChange={v => setEditData(prev => ({
                                                                                               ...prev,
                                                                                               total_area: v ? Number(v) : 0
                                                                                           }))}/></Col>
                        <Col span={12}><Text type="secondary">Жилая пл.</Text><InputNumber style={{width: '100%'}}
                                                                                           value={editData.living_area}
                                                                                           onChange={v => setEditData(prev => ({
                                                                                               ...prev,
                                                                                               living_area: v ? Number(v) : 0
                                                                                           }))}/></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}><Text type="secondary">Год</Text><InputNumber style={{width: '100%'}}
                                                                                    value={editData.year}
                                                                                    onChange={v => setEditData(prev => ({
                                                                                        ...prev,
                                                                                        year: v ? Number(v) : 2026
                                                                                    }))}/></Col>
                        <Col span={8}><Text type="secondary">Семья</Text><InputNumber style={{width: '100%'}}
                                                                                      value={editData.family_count}
                                                                                      onChange={v => setEditData(prev => ({
                                                                                          ...prev,
                                                                                          family_count: v ? Number(v) : 1
                                                                                      }))}/></Col>
                        <Col span={8}><Text type="secondary">Собак</Text><InputNumber style={{width: '100%'}}
                                                                                      value={editData.dog_count}
                                                                                      onChange={v => setEditData(prev => ({
                                                                                          ...prev,
                                                                                          dog_count: v ? Number(v) : 0
                                                                                      }))}/></Col>
                    </Row>
                </div>
            </Modal>

            {/* Модалка печати */}
            <Modal
                title="Печать извещения"
                open={isPrintModalOpen}
                onOk={() => {
                    // Вызываем печать, затем закрываем
                    if (handlePrint) handlePrint();
                    setIsPrintModalOpen(false);
                }}
                onCancel={() => setIsPrintModalOpen(false)}
                okText="Печать"
                cancelText="Отмена"
            >
                <div style={{padding: '10px 0'}}>
                    <p>Выберите месяц:</p>
                    <Select
                        style={{width: '100%'}}
                        value={printMonth}
                        onChange={setPrintMonth}
                        options={MONTHS_LABELS.map((label, i) => ({label, value: i + 1}))}
                    />
                </div>

                {/* Технический контейнер для захвата контента */}
                <div style={{position: 'absolute', left: '-9999px', top: '0'}}>
                    <div ref={printRef}>
                        {resident && (
                            <NoticePrint
                                resident={resident}
                                tariffs={tariffs}
                                month={printMonth}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ResidentDetails;