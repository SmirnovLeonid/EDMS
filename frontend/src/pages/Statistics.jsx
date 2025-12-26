import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart2, AlertTriangle, FileText, Users, TrendingUp } from 'lucide-react';

const Statistics = () => {
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

    if (loading) {
        return <div className="p-6 text-gray-500">Загрузка...</div>;
    }

    if (!stats) {
        return <div className="p-6 text-red-500">Ошибка загрузки статистики</div>;
    }

    const statusColors = {
        draft: 'bg-gray-100 text-gray-700',
        pending: 'bg-orange-100 text-orange-700',
        in_progress: 'bg-blue-100 text-blue-700',
        approved: 'bg-green-100 text-green-700',
        completed: 'bg-teal-100 text-teal-700',
        rejected: 'bg-red-100 text-red-700',
        archived: 'bg-purple-100 text-purple-700',
    };

    const statusLabels = {
        draft: 'Черновик',
        pending: 'На согласовании',
        in_progress: 'На исполнении',
        approved: 'Утвержден',
        completed: 'Исполнен',
        rejected: 'Отклонен',
        archived: 'Архив',
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart2 size={28} /> Статистика
            </h1>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{stats.total_documents}</div>
                            <div className="text-gray-500 text-sm">Всего документов</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users size={24} className="text-orange-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{stats.total_assignments}</div>
                            <div className="text-gray-500 text-sm">Всего заданий</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-red-600">{stats.overdue_count}</div>
                            <div className="text-gray-500 text-sm">Просроченных</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp size={24} className="text-green-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{stats.docs_this_month}</div>
                            <div className="text-gray-500 text-sm">За этот месяц</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Documents by status */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Документы по статусам</h2>
                    <div className="space-y-3">
                        {stats.status_stats.map(item => (
                            <div key={item.status} className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded ${statusColors[item.status] || 'bg-gray-100'}`}>
                                    {statusLabels[item.status] || item.status}
                                </span>
                                <span className="font-bold text-gray-800">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents by type */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Документы по типам</h2>
                    <div className="space-y-3">
                        {stats.type_stats.map(item => (
                            <div key={item.document_type__name} className="flex items-center justify-between">
                                <span className="text-gray-700">{item.document_type__name}</span>
                                <span className="font-bold text-gray-800">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assignments by status */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Задания по статусам</h2>
                    <div className="space-y-3">
                        {stats.assignment_stats.map(item => (
                            <div key={item.status} className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded ${statusColors[item.status] || 'bg-gray-100'}`}>
                                    {item.status}
                                </span>
                                <span className="font-bold text-gray-800">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top executors */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Лучшие исполнители</h2>
                    <div className="space-y-3">
                        {stats.top_executors.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-gray-700">
                                    {item.assignee__first_name} {item.assignee__last_name}
                                </span>
                                <span className="font-bold text-green-600">{item.count} выполнено</span>
                            </div>
                        ))}
                        {stats.top_executors.length === 0 && (
                            <div className="text-gray-500">Нет данных</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
