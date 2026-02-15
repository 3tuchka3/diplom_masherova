import React, { forwardRef } from 'react';

interface Props {
    resident: any;
    tariffs: any[];
    month: number;
}

const NoticePrint = forwardRef<HTMLDivElement, Props>(({ resident, tariffs, month }, ref) => {
    if (!resident) return null;

    const monthNames = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const payment = (resident.payments?.find((p: any) => Number(p.month) === month) || {}) as any;

    // Вспомогательная функция для определения логики услуги
    const getServiceDetails = (serviceName: string) => {
        const name = serviceName.toLowerCase();

        // 1. Услуги, зависящие от количества людей
        if (name.includes('вода') || name.includes('вод') || name.includes('электр') ||
            name.includes('отход') || name.includes('тко') || name.includes('лифт')) {
            return { unit: 'чел.', quantity: resident.family_count || 0 };
        }

        // 2. Специфическая услуга для собак
        if (name.includes('собак')) {
            return { unit: 'шт.', quantity: resident.dog_count || 0 };
        }

        // 3. По умолчанию — от площади
        return { unit: 'кв.м', quantity: resident.total_area || 0 };
    };

    const tdStyle: React.CSSProperties = {
        border: '1px solid #000',
        padding: '2px 4px',
        fontSize: '10px', // Уменьшил шрифт для соответствия оригиналу
        lineHeight: '1.2'
    };

    const headerTdStyle: React.CSSProperties = {
        ...tdStyle,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#f2f2f2'
    };

    const totalServiceSum = tariffs.reduce((acc, t) => acc + Number(payment[t.service_name] || 0), 0);

    return (
        <div ref={ref} style={{ padding: '15mm', color: '#000', backgroundColor: '#fff', fontFamily: '"Times New Roman", Times, serif', width: '210mm' }}>
            {/* Заголовок */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', textDecoration: 'underline' }}>
                ИЗВЕЩЕНИЕ за {monthNames[month - 1]} {resident.year} года
            </div>
            <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '8px' }}>
                о размере платы за жилищно-коммунальные услуги и платы за пользование жилым помещением
            </div>

            {/* Шапка: Плательщик и Получатель */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
                <tbody>
                    <tr>
                        <td style={{ ...tdStyle, width: '45%' }}>
                            <b>Плательщик:</b> <span style={{ fontSize: '12px' }}>{resident.full_name}</span><br />
                            <b>Адрес:</b> Витебск, комната {resident.room_number}<br />
                            <b>Лицевой счет:</b> <span style={{ fontSize: '12px' }}>{resident.account_number}</span>
                        </td>
                        <td style={{ ...tdStyle }}>
                            <b>Получатель платежа:</b> ОАО "Витебские ковры"<br />
                            <b>Банк:</b> ОАО "Белинвестбанк", Витебск, Ленина, 22/16<br />
                            <b>Счет:</b> BY16BLBB30120300082076001001 | <b>УНП:</b> 300082076
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Характеристики */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <tbody>
                    <tr style={{ textAlign: 'center' }}>
                        <td style={tdStyle}>Количество проживающих: <b>{resident.family_count}</b></td>
                        <td style={tdStyle}>Общая площадь: <b>{resident.total_area}</b></td>
                        <td style={tdStyle}>Жилая площадь: <b>{resident.living_area}</b></td>
                    </tr>
                </tbody>
            </table>

            {/* Таблица услуг */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <td style={{ ...headerTdStyle, width: '35%' }}>Перечень услуг</td>
                        <td style={headerTdStyle}>Ед.изм.</td>
                        <td style={headerTdStyle}>Кол-во</td>
                        <td style={headerTdStyle}>Тариф</td>
                        <td style={headerTdStyle}>Начислено</td>
                        <td style={headerTdStyle}>Перерасчет</td>
                        <td style={headerTdStyle}>Итого</td>
                    </tr>
                </thead>
                <tbody>
                    {tariffs.map((t: any, index: number) => {
                        const { unit, quantity } = getServiceDetails(t.label || t.service_name);
                        const amount = Number(payment[t.service_name] || 0);

                        return (
                            <tr key={t.id}>
                                <td style={tdStyle}>{index + 1}. {t.label}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>{unit}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>{quantity}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>{Number(t.value).toFixed(4)}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>{amount.toFixed(4)}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>0.000</td>
                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>{amount.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                    {/* Суммарная строка */}
                    <tr>
                        <td colSpan={4} style={{ ...tdStyle, fontWeight: 'bold' }}>Итого за услуги:</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{totalServiceSum.toFixed(4)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>0.000</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e6e6e6' }}>{totalServiceSum.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Справочная и Итого */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <tbody>
                    <tr>
                        <td style={{ ...tdStyle, width: '40%', borderBottom: 'none' }}><b>СПРАВОЧНАЯ ИНФОРМАЦИЯ</b></td>
                        <td style={tdStyle}>Итого начислено</td>
                        <td style={{ ...tdStyle, width: '15%', textAlign: 'right', fontWeight: 'bold' }}>{totalServiceSum.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style={{ ...tdStyle, borderTop: 'none', borderBottom: 'none' }}>Тел. для справок: 66-48-03</td>
                        <td style={tdStyle}>Пеня / Долг</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr>
                        <td style={{ ...tdStyle, borderTop: 'none' }}>Режим: с 8.15 - 16.40</td>
                        <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '12px', backgroundColor: '#ccc' }}>К ОПЛАТЕ</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', fontSize: '12px', backgroundColor: '#ccc' }}>{totalServiceSum.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

NoticePrint.displayName = 'NoticePrint';

export default NoticePrint;