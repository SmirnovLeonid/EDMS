import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Check, Play, Clock } from 'lucide-react';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/assignments/');
            setAssignments(response.data);
        } catch (error) {
            console.error('Failed to fetch assignments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.post(`/assignments/${id}/accept/`);
            fetchAssignments();
        } catch (error) {
            alert('Ошибка при принятии задания');
        }
    };

    const handleComplete = async (id) => {
        const response = prompt('Введите отчет о выполнении:');
        if (response === null) return;

        try {
            await api.post(`/assignments/${id}/complete/`, { response });
            fetchAssignments();
        } catch (error) {
            alert('Ошибка при завершении задания');
        }
    };

    const filteredAssignments = assignments.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending', 'accepted', 'in_progress'].includes(a.status);
        return a.status === filter;
    });

    if (loading) {
        return <div className="p-6 text-gray-500">Загрузка...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Мои задания</h1>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { value: 'pending', label: 'Активные' },
                    { value: 'completed', label: 'Выполненные' },
                    { value: 'all', label: 'Все' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 rounded-lg transition ${filter === tab.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Assignments list */}
            <div className="space-y-4">
                {filteredAssignments.map(a => (
                    <div key={a.id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <Link
                                    to={`/documents/${a.document}`}
                                    className="text-lg font-medium text-blue-600 hover:underline"
                                >
                                    Документ #{a.document}
                                </Link>
                                <div className="text-sm text-gray-500 mt-1">
                                    Назначил: {a.assigned_by_name} | {new Date(a.created_at).toLocaleDateString()}
                                </div>
                                {a.deadline && (
                                    <div className="text-sm text-red-500 mt-1">
                                        <Clock size={14} className="inline mr-1" />
                                        Срок: {a.deadline}
                                    </div>
                                )}
                                {a.instruction && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                        <strong>Резолюция:</strong> {a.instruction}
                                    </div>
                                )}
                                {a.response && (
                                    <div className="mt-2 p-3 bg-green-50 rounded text-sm text-gray-700">
                                        <strong>Ответ:</strong> {a.response}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${a.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            a.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                    }`}>
                                    {a.status_display}
                                </span>

                                {a.assignee === user.id && a.status === 'pending' && (
                                    <button
                                        onClick={() => handleAccept(a.id)}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                        <Play size={14} /> Принять
                                    </button>
                                )}

                                {a.assignee === user.id && ['accepted', 'in_progress'].includes(a.status) && (
                                    <button
                                        onClick={() => handleComplete(a.id)}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                    >
                                        <Check size={14} /> Выполнено
                                    </button>
                                )}
                            </div>
                        </div>
                        {a.signature && (
                            <div className="mt-2 text-xs text-gray-400">
                                Подпись: {a.signature.substring(0, 16)}... ({new Date(a.signed_at).toLocaleString()})
                            </div>
                        )}
                    </div>
                ))}

                {filteredAssignments.length === 0 && (
                    <div className="text-center text-gray-500 py-8">Заданий не найдено</div>
                )}
            </div>
        </div>
    );
};

export default Assignments;
