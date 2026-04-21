import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';

const TemplateList = () => {
    const [templates, setTemplates] = useState([]);

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить этот шаблон?')) return;
        const res = await fetch(`http://localhost:8000/api/templates/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        if (res.ok) {
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            const res = await fetch('http://localhost:8000/api/templates/', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(Array.isArray(data) ? data : []);
            } else setTemplates([]);
        };
        fetchTemplates();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Шаблоны документов</h1>
                <Link to="/templates/new" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
                    <Plus size={20} /> Создать шаблон
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="relative bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
                        <button onClick={() => handleDelete(t.id)} title="Удалить шаблон" className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm">
                            <Trash2 size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-4 pr-10">
                            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><FileText size={24} /></div>
                            <h3 className="text-xl font-bold text-slate-800 truncate" title={t.name}>{t.name}</h3>
                        </div>
                        <p className="text-indigo-700 mb-6 text-sm bg-indigo-50 w-max px-3 py-1 rounded-full">{t.type}</p>
                        <Link to={`/templates/${t.id}/use`} className="block text-center w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-indigo-500/25">
                            Создать документ
                        </Link>
                    </div>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-indigo-600 bg-slate-50 rounded-2xl border border-slate-200">
                        У вас пока нет ни одного шаблона.
                    </div>
                )}
            </div>
        </div>
    );
};
export default TemplateList;
