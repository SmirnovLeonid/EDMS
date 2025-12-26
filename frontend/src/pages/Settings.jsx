import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Plus, Edit, Trash2, Save, LayoutGrid, List } from 'lucide-react';
import RoutingGraph from '../components/RoutingGraph';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [approvalRoutes, setApprovalRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('graph'); // 'list' or 'graph'

    // Form states
    const [newDeptName, setNewDeptName] = useState('');
    const [newTypeName, setNewTypeName] = useState('');
    const [newRoute, setNewRoute] = useState({ document_type: '', step_order: 1, approver_role: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [deptsRes, typesRes, routesRes] = await Promise.all([
                api.get('/departments/'),
                api.get('/types/'),
                api.get('/workflow/routes/')
            ]);
            setDepartments(deptsRes.data);
            setDocumentTypes(typesRes.data);
            setApprovalRoutes(routesRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;
        try {
            await api.post('/departments/', { name: newDeptName });
            setNewDeptName('');
            fetchData();
        } catch (error) {
            alert('Ошибка при создании подразделения');
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!confirm('Удалить подразделение?')) return;
        try {
            await api.delete(`/departments/${id}/`);
            fetchData();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        if (!newTypeName.trim()) return;
        try {
            await api.post('/types/', { name: newTypeName });
            setNewTypeName('');
            fetchData();
        } catch (error) {
            alert('Ошибка при создании типа документа');
        }
    };

    const handleDeleteType = async (id) => {
        if (!confirm('Удалить тип документа?')) return;
        try {
            await api.delete(`/types/${id}/`);
            fetchData();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        if (!newRoute.document_type || !newRoute.approver_role) {
            alert('Пожалуйста, выберите тип документа и роль согласующего');
            return;
        }
        try {
            await api.post('/workflow/routes/', newRoute);
            setNewRoute({ document_type: '', step_order: 1, approver_role: '' });
            fetchData();
        } catch (error) {
            alert('Ошибка при создании маршрута');
        }
    };

    const handleDeleteRoute = async (id) => {
        if (!confirm('Удалить маршрут?')) return;
        try {
            await api.delete(`/workflow/routes/${id}/`);
            fetchData();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const roleOptions = [
        { value: 'dept_head', label: 'Руководитель подразделения' },
        { value: 'prorector', label: 'Проректор' },
        { value: 'rector', label: 'Ректор' },
        { value: 'admin', label: 'Администратор' },
        { value: 'employee', label: 'Сотрудник' },
        { value: 'secretary', label: 'Секретарь' },
        { value: 'council_member', label: 'Ученый совет' },
    ];

    if (loading) return <div className="p-6 text-gray-500">Загрузка...</div>;

    if (user.role !== 'admin') {
        return <div className="p-6 text-red-500">Доступ запрещен. Только для администраторов.</div>;
    }

    const tabs = [
        { id: 'departments', label: 'Подразделения' },
        { id: 'types', label: 'Типы документов' },
        { id: 'routes', label: 'Маршруты согласования' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <SettingsIcon size={28} /> Настройки
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 -mb-px transition ${activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Departments tab */}
            {activeTab === 'departments' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleAddDepartment} className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            placeholder="Название подразделения"
                            className="flex-1 border rounded-lg px-4 py-2"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={18} /> Добавить
                        </button>
                    </form>
                    <div className="space-y-2">
                        {departments.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span>{d.name}</span>
                                <button onClick={() => handleDeleteDepartment(d.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Types tab */}
            {activeTab === 'types' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleAddType} className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="Название типа документа"
                            className="flex-1 border rounded-lg px-4 py-2"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={18} /> Добавить
                        </button>
                    </form>
                    <div className="space-y-2">
                        {documentTypes.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span>{t.name}</span>
                                <button onClick={() => handleDeleteType(t.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approval Routes tab */}
            {activeTab === 'routes' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-700">Настройка маршрутов</h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Список"
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`p-2 rounded-md transition ${viewMode === 'graph' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Граф"
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleAddRoute} className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <select
                            value={newRoute.document_type}
                            onChange={(e) => setNewRoute({ ...newRoute, document_type: e.target.value })}
                            className="border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="">Тип документа</option>
                            {documentTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={newRoute.step_order}
                            onChange={(e) => setNewRoute({ ...newRoute, step_order: parseInt(e.target.value) })}
                            placeholder="Шаг"
                            className="w-20 border rounded-lg px-4 py-2 bg-white"
                            min="1"
                        />
                        <select
                            value={newRoute.approver_role}
                            onChange={(e) => setNewRoute({ ...newRoute, approver_role: e.target.value })}
                            className="border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="">Роль согласующего</option>
                            {roleOptions.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                            <Plus size={18} /> Добавить шаг
                        </button>
                    </form>

                    {viewMode === 'list' ? (
                        <div className="space-y-2">
                            {approvalRoutes.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {r.step_order}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-800">{documentTypes.find(t => t.id === r.document_type)?.name}</span>
                                            <span className="mx-3 text-gray-400">→</span>
                                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                                                {roleOptions.find(ro => ro.value === r.approver_role)?.label || r.approver_role}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteRoute(r.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {approvalRoutes.length === 0 && (
                                <div className="text-center py-12 text-gray-400 italic">Маршруты не найдены</div>
                            )}
                        </div>
                    ) : (
                        <RoutingGraph routes={approvalRoutes} documentTypes={documentTypes} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Settings;
