import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertOctagon, UserX, Clock, Users } from 'lucide-react';

const PredictDashboard = () => {
    const [overdue, setOverdue] = useState([]);
    const [overloaded, setOverloaded] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` };

                const [resOverdue, resOverloaded] = await Promise.all([
                    fetch('http://localhost:8000/api/predict/overdue/', { headers }),
                    fetch('http://localhost:8000/api/predict/overloaded/', { headers })
                ]);

                if (resOverdue.ok) {
                    const data = await resOverdue.json();
                    setOverdue(Array.isArray(data) ? data : []);
                } else setOverdue([]);

                if (resOverloaded.ok) {
                    const data = await resOverloaded.json();
                    setOverloaded(Array.isArray(data) ? data : []);
                } else setOverloaded([]);
            } catch (error) {
                console.error("Prediction error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="animate-pulse flex items-center gap-3 text-indigo-600 font-bold text-xl">
                    <BrainCircuit className="animate-spin text-indigo-500" size={32} />
                    Анализ данных...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent w-max mb-8 flex items-center gap-3">
                <BrainCircuit size={32} className="text-indigo-600" />
                Предиктивная AI Аналитика
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Overdue Predictor */}
                <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-6">
                        <AlertOctagon /> Риск срыва сроков
                    </h2>
                    <div className="space-y-4">
                        {overdue.length === 0 ? (
                            <div className="text-gray-500 italic">Рисков не выявлено.</div>
                        ) : (
                            overdue.map((doc, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 border border-red-100 rounded-xl hover:bg-slate-100 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-slate-800">{doc.document_title}</div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${doc.remaining_days < 0 ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>
                                            Осталось: {doc.remaining_days} дн.
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-slate-100">
                                        <span className="flex items-center gap-1"><UserX size={14} /> Исп.: {doc.assignee}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> Прогноз исполнения: {doc.avg_execution_time} дн.</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Overload Predictor */}
                <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2 mb-6">
                        <Users /> Перегруженные сотрудники
                    </h2>
                    <div className="space-y-4">
                        {overloaded.length === 0 ? (
                            <div className="text-gray-500 italic">Сотрудников с аномальной нагрузкой не выявлено.</div>
                        ) : (
                            overloaded.map((emp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 border border-orange-100 rounded-xl hover:bg-slate-100 transition-all flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-slate-800 mb-1">{emp.name}</div>
                                        <div className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded w-max">
                                            {emp.department}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-orange-600 leading-none">{emp.active_tasks}</div>
                                        <div className="text-xs text-gray-500 mt-1">задач в работе (норма: {emp.average_system_load})</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
export default PredictDashboard;
