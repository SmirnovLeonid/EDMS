import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const DocumentCreate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [file, setFile] = useState(null);
    const [assignTo, setAssignTo] = useState('');
    const [instruction, setInstruction] = useState('');
    const [types, setTypes] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, usersRes] = await Promise.all([
                    api.get('/types/'),
                    api.get('/users/list/')
                ]);
                setTypes(typesRes.data);
                setUsers(usersRes.data);
                if (typesRes.data.length > 0) {
                    setType(typesRes.data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('document_type', type);
            formData.append('priority', priority);
            if (deadline) formData.append('deadline', deadline);
            if (file) formData.append('file', file);

            // Create document
            const docRes = await api.post('/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const docId = docRes.data.id;

            // If assignTo is selected, create assignment and submit
            if (assignTo) {
                await api.post(`/documents/${docId}/assign/`, {
                    assignee: assignTo,
                    instruction: instruction,
                    deadline: deadline || null
                });

                // Auto-submit the document
                await api.post(`/documents/${docId}/submit/`);
            }

            navigate(`/documents/${docId}`);
        } catch (error) {
            console.error('Failed to create document', error);
            alert('Ошибка при создании документа');
        } finally {
            setLoading(false);
        }
    };

    const priorityOptions = [
        { value: 'low', label: 'Низкий' },
        { value: 'medium', label: 'Средний' },
        { value: 'high', label: 'Высокий' },
        { value: 'urgent', label: 'Срочный' },
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Создание документа</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Basic info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа *</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {priorityOptions.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows="4"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Файл</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Срок исполнения</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Assignment section */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Назначение исполнителя</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        При выборе исполнителя документ будет автоматически отправлен на согласование и назначен указанному сотруднику.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Назначить</label>
                            <select
                                value={assignTo}
                                onChange={(e) => setAssignTo(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Не назначать (черновик)</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name} ({u.department_name || 'Без подразделения'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {assignTo && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Резолюция / Указание</label>
                            <textarea
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                rows="2"
                                placeholder="Введите указание для исполнителя..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Создание...' : assignTo ? 'Создать и назначить' : 'Создать черновик'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentCreate;
