import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [myDocs, setMyDocs] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docsRes = await api.get('/documents/');
                setMyDocs(docsRes.data.slice(0, 5));

                const assignRes = await api.get('/assignments/');
                setMyAssignments(assignRes.data.filter(a => a.assignee === user.id && a.status !== 'completed').slice(0, 5));

                if (['admin', 'rector', 'prorector'].includes(user.role)) {
                    const statsRes = await api.get('/workflow/statistics/');
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-indigo-600 font-medium">Загрузка...</span>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            {/* Glow effect */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

            <div className="relative flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon size={28} className="text-white" />
                </div>
                <div>
                    <div className="text-4xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {value}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">{label}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                        <h1 className="text-3xl font-bold text-gray-800">Рабочий стол</h1>
                    </div>
                    <p className="text-gray-500 ml-5">Добро пожаловать, {user?.full_name || user?.username}!</p>
                </div>
                <Link
                    to="/documents/new"
                    className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
                >
                    <Plus size={20} />
                    <span className="font-medium">Создать документ</span>
                    <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
            </div>

            {/* Stats cards for managers */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={FileText} label="Всего документов" value={stats.total_documents} color="from-blue-500 to-indigo-600" delay={0} />
                    <StatCard icon={Clock} label="Активных заданий" value={stats.total_assignments} color="from-orange-500 to-amber-500" delay={100} />
                    <StatCard icon={AlertTriangle} label="Просроченных" value={stats.overdue_count} color="from-red-500 to-rose-600" delay={200} />
                    <StatCard icon={TrendingUp} label="За этот месяц" value={stats.docs_this_month} color="from-emerald-500 to-green-600" delay={300} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Tasks/Assignments */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                                <Clock size={20} className="text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                Мои задания
                            </span>
                            <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-medium">
                                {myAssignments.length}
                            </span>
                        </h2>
                    </div>

                    {myAssignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <CheckCircle size={48} className="mb-3 text-green-400" />
                            <p className="font-medium">Нет активных заданий</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {myAssignments.map((a, index) => (
                                <li
                                    key={a.id}
                                    className="group p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Link to={`/documents/${a.document}`} className="block">
                                        <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            Задание #{a.id}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm mt-2">
                                            <span className="text-gray-500">От: {a.assigned_by_name}</span>
                                            {a.deadline && (
                                                <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                                                    <Clock size={12} /> {a.deadline}
                                                </span>
                                            )}
                                        </div>
                                        {a.instruction && (
                                            <p className="text-sm text-gray-600 mt-2 truncate">{a.instruction}</p>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to="/assignments" className="flex items-center gap-2 text-orange-600 text-sm mt-6 font-medium hover:gap-3 transition-all duration-300">
                        Все задания <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Recent Documents */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                <FileText size={20} className="text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Последние документы
                            </span>
                        </h2>
                    </div>

                    {myDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <FileText size={48} className="mb-3" />
                            <p className="font-medium">Нет документов</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {myDocs.map((doc, index) => (
                                <li
                                    key={doc.id}
                                    className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Link to={`/documents/${doc.id}`} className="block">
                                        <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                            {doc.registration_number || 'Б/Н'} - {doc.title}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${doc.status === 'approved' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                                                    doc.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' :
                                                        doc.status === 'pending' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700' :
                                                            doc.status === 'in_progress' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                {doc.status_display}
                                            </span>
                                            <span className="text-gray-400 text-sm">{new Date(doc.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to="/documents" className="flex items-center gap-2 text-indigo-600 text-sm mt-6 font-medium hover:gap-3 transition-all duration-300">
                        Все документы <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
