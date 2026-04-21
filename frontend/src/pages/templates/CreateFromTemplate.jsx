import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, FileCheck } from 'lucide-react';

const CreateFromTemplate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [docTypes, setDocTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        const fetchTypes = async () => {
            const res = await fetch('http://localhost:8000/api/types/', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            const data = await res.json();
            setDocTypes(data);
            if (data.length > 0) setSelectedType(data[0].id);
        };
        fetchTypes();
    }, []);

    const handleCreate = async () => {
        const res = await fetch('http://localhost:8000/api/documents/from-template/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template_id: id,
                title,
                document_type_id: selectedType
            })
        });
        if (res.ok) {
            const data = await res.json();
            navigate(`/documents/${data.id}`);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Создать по шаблону</h1>
            <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl space-y-6 shadow-xl">
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <FileCheck className="text-indigo-600" size={32} />
                    <p className="text-indigo-900 text-sm leading-relaxed">
                        При создании нового документа система автоматически возьмет выбранный шаблон и подставит вместо переменных ваши системные данные (ФИО, подразделение и т.д.). Регистрационный номер документа будет присвоен автоматически только после его утверждения.
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Название будущего документа</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Укажите заголовок документа" className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 rounded-xl p-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Системный тип документа</label>
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 rounded-xl p-3">
                        {docTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <button onClick={handleCreate} disabled={!title} className={`flex gap-2 items-center px-6 py-3 rounded-xl transition-all shadow-lg ${!title ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20'}`}>
                    <Send size={20} /> Сгенерировать и открыть проект
                </button>
            </div>
        </div>
    );
};
export default CreateFromTemplate;
