import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    FileText, Users, AlertTriangle, TrendingUp, Download,
    FileSpreadsheet, PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280'];

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/workflow/statistics/');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch statistics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statusLabels = {
        draft: 'Черновик',
        pending: 'На согласовании',
        in_progress: 'На исполнении',
        approved: 'Утвержден',
        completed: 'Исполнен',
        rejected: 'Отклонен',
        archived: 'Архив',
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.text('Аналитический отчет', 14, 22);
        doc.setFontSize(10);
        doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30);

        // Summary
        doc.setFontSize(14);
        doc.text('Сводка', 14, 45);
        doc.autoTable({
            startY: 50,
            head: [['Показатель', 'Значение']],
            body: [
                ['Всего документов', stats.total_documents],
                ['Всего заданий', stats.total_assignments],
                ['Просроченных', stats.overdue_count],
                ['За этот месяц', stats.docs_this_month],
                ['Выполнение (%)', `${stats.completion_rate}%`],
            ],
        });

        // Status stats
        doc.text('Документы по статусам', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Статус', 'Количество']],
            body: stats.status_stats.map(item => [statusLabels[item.status] || item.status, item.count]),
        });

        // Type stats
        doc.text('Документы по типам', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Тип', 'Количество']],
            body: stats.type_stats.map(item => [item.document_type__name, item.count]),
        });

        doc.save('analytics_report.pdf');
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['Показатель', 'Значение'],
            ['Всего документов', stats.total_documents],
            ['Всего заданий', stats.total_assignments],
            ['Просроченных', stats.overdue_count],
            ['За этот месяц', stats.docs_this_month],
            ['Выполнение (%)', stats.completion_rate],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Сводка');

        // Status stats
        const statusData = [['Статус', 'Количество'], ...stats.status_stats.map(item => [statusLabels[item.status] || item.status, item.count])];
        const ws2 = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, ws2, 'По статусам');

        // Type stats
        const typeData = [['Тип', 'Количество'], ...stats.type_stats.map(item => [item.document_type__name, item.count])];
        const ws3 = XLSX.utils.aoa_to_sheet(typeData);
        XLSX.utils.book_append_sheet(wb, ws3, 'По типам');

        // Monthly trends
        const trendsData = [['Месяц', 'Количество'], ...stats.monthly_trends.map(item => [item.month, item.count])];
        const ws4 = XLSX.utils.aoa_to_sheet(trendsData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Тренды');

        XLSX.writeFile(wb, 'analytics_report.xlsx');
    };

    if (loading) {
        return <div className="p-6 text-gray-500">Загрузка аналитики...</div>;
    }

    if (!stats) {
        return <div className="p-6 text-red-500">Ошибка загрузки данных</div>;
    }

    const pieData = stats.status_stats.map(item => ({
        name: statusLabels[item.status] || item.status,
        value: item.count
    }));

    const barData = stats.type_stats.map(item => ({
        name: item.document_type__name,
        count: item.count
    }));

    const executorsData = stats.top_executors.map(item => ({
        name: `${item.assignee__first_name} ${item.assignee__last_name}`,
        count: item.count
    }));

    return (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <PieChartIcon size={32} className="text-blue-600" />
                    Аналитика
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Download size={18} /> PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.total_documents}</div>
                            <div className="text-gray-500 text-sm">Всего документов</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-orange-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users size={24} className="text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.total_assignments}</div>
                            <div className="text-gray-500 text-sm">Всего заданий</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue_count}</div>
                            <div className="text-gray-500 text-sm">Просроченных</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp size={24} className="text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.docs_this_month}</div>
                            <div className="text-gray-500 text-sm">За этот месяц</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{stats.completion_rate}%</div>
                            <div className="text-gray-500 text-sm">Выполнение</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pie Chart - Documents by Status */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Документы по статусам</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart - Documents by Type */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Документы по типам</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart - Monthly Trends */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Динамика по месяцам</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.monthly_trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                name="Документы"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Horizontal Bar Chart - Top Executors */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Лучшие исполнители</h2>
                    {executorsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={executorsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="Выполнено" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Нет данных о выполненных заданиях
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
