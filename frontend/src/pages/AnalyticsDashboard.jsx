import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

const AnalyticsDashboard = () => {
    const [kpi, setKpi] = useState({
        average_approval_hours: 0,
        overdue_documents: 0,
        employee_load: 0,
        top_departments: [],
        execution_efficiency: 0
    });
    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const kpiRes = await fetch('http://localhost:8000/api/analytics/kpi/', { headers });
            if (kpiRes.ok) {
                const kpiData = await kpiRes.json();
                if (kpiData && Array.isArray(kpiData.top_departments)) {
                    setKpi(kpiData);
                }
            }

            const heatRes = await fetch('http://localhost:8000/api/analytics/heatmap/', { headers });
            if (heatRes.ok) {
                const heatData = await heatRes.json();
                setHeatmap(Array.isArray(heatData) ? heatData : []);
            } else {
                setHeatmap([]);
            }
        } catch (error) {
            console.error('Error fetching analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-300"></div>
            </div>
        );
    }

    const efficiencyData = [
        { name: 'Выполнено', value: kpi.execution_efficiency },
        { name: 'Остальное', value: 100 - kpi.execution_efficiency }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent w-max mb-8">
                KPI Дашборд и Аналитика
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Среднее время согл."
                    value={`${kpi.average_approval_hours} ч`}
                    icon={Clock}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <KpiCard
                    title="Просроченные документы"
                    value={kpi.overdue_documents}
                    icon={AlertTriangle}
                    color="text-red-600"
                    bg="bg-red-500/10"
                />
                <KpiCard
                    title="Нагрузка (активные задачи)"
                    value={kpi.employee_load}
                    icon={Users}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                />
                <KpiCard
                    title="Эффективность"
                    value={`${kpi.execution_efficiency}%`}
                    icon={TrendingUp}
                    color="text-green-400"
                    bg="bg-green-500/10"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Dynamika - Line Chart for Activity */}
                <ChartCard title="Динамика активности по дням (Heatmap/Line)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={heatmap}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none', borderRadius: '8px', color: '#0f172a' }} />
                            <Line type="monotone" dataKey="count" name="Действия" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Top Departments - Bar Chart */}
                <ChartCard title="Топ активных подразделений">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={kpi.top_departments}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none', borderRadius: '8px', color: '#0f172a' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                            <Bar dataKey="count" name="Документы" radius={[4, 4, 0, 0]}>
                                {kpi.top_departments.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Statuses / Efficiency - Pie Chart */}
                <ChartCard title="Эффективность исполнения (Выполнено vs Остальные)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={efficiencyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none', borderRadius: '8px', color: '#0f172a' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 w-full">{title}</h3>
        {children}
    </div>
);

export default AnalyticsDashboard;
