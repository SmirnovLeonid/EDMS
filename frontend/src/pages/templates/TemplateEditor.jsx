import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const TemplateEditor = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Заявление');
    const [text, setText] = useState('Я, {{ full_name }}, сотрудник отдела {{ department }} в должности {{ position }}...\n\nДата: {{ date }}');
    const navigate = useNavigate();

    const handleSave = async () => {
        const res = await fetch('http://localhost:8000/api/templates/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type, template_text: text })
        });
        if (res.ok) navigate('/templates');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Создание шаблона</h1>
            <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Название шаблона</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Например: Заявление на отпуск" className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 rounded-xl p-3 transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Категория</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 rounded-xl p-3">
                        <option value="Заявление">Заявление</option>
                        <option value="Приказ">Приказ</option>
                        <option value="Служебная записка">Служебная записка</option>
                        <option value="Договор">Договор</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Текст шаблона</label>
                    <div className="text-xs text-indigo-900 mb-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                        <strong>Доступные переменные автозаполнения:</strong>
                        <code className="mx-2 text-pink-400">{'{{ full_name }}'}</code>
                        <code className="mx-2 text-pink-400">{'{{ department }}'}</code>
                        <code className="mx-2 text-pink-400">{'{{ position }}'}</code>
                        <code className="mx-2 text-pink-400">{'{{ date }}'}</code>
                        <code className="mx-2 text-pink-400">{'{{ document_number }}'}</code>
                    </div>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={12} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 rounded-xl p-4 font-mono text-sm leading-relaxed" />
                </div>
                <button onClick={handleSave} className="flex gap-2 items-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                    <Save size={20} /> Сохранить в базу
                </button>
            </div>
        </div>
    );
};
export default TemplateEditor;
