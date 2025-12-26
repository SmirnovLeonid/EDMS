import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [statusFilter]);

    const fetchDocuments = async () => {
        try {
            let url = '/documents/';
            if (statusFilter) {
                url += `?status=${statusFilter}`;
            }
            const response = await api.get(url);
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        (doc.registration_number && doc.registration_number.includes(search))
    );

    const statusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'draft', label: 'Черновик' },
        { value: 'pending', label: 'На согласовании' },
        { value: 'approved', label: 'Утвержден' },
        { value: 'in_progress', label: 'На исполнении' },
        { value: 'completed', label: 'Исполнен' },
        { value: 'rejected', label: 'Отклонен' },
    ];

    if (loading) {
        return <div className="p-6 text-gray-500">Загрузка...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Документы</h1>
                <Link
                    to="/documents/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Создать
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по названию или номеру..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Documents table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Рег. номер</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Название</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Тип</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Статус</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Создатель</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocs.map(doc => (
                            <tr key={doc.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                                        {doc.registration_number || 'Б/Н'}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    <Link to={`/documents/${doc.id}`} className="hover:text-blue-600">
                                        {doc.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{doc.type_name}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                doc.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    doc.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        doc.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {doc.status_display}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{doc.creator_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredDocs.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Документы не найдены</div>
                )}
            </div>
        </div>
    );
};

export default Documents;
