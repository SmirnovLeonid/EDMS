import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit, Trash2, Search } from 'lucide-react';

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        role: 'employee',
        department: '',
        phone: '',
        supervisor: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/users/manage/'),
                api.get('/departments/')
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: 'admin', label: 'Администратор' },
        { value: 'rector', label: 'Ректор' },
        { value: 'prorector', label: 'Проректор' },
        { value: 'dept_head', label: 'Руководитель подразделения' },
        { value: 'employee', label: 'Сотрудник' },
        { value: 'secretary', label: 'Секретарь' },
        { value: 'council_member', label: 'Член ученого совета' },
    ];

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            username: '', password: '', first_name: '', last_name: '', middle_name: '',
            email: '', role: 'employee', department: '', position: '', phone: '', supervisor: ''
        });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '', // Leave empty for editing
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            middle_name: user.middle_name || '',
            email: user.email || '',
            role: user.role || 'employee',
            department: user.department || '',
            phone: user.phone || '',
            supervisor: user.supervisor || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.delete(`/users/manage/${userId}/`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete user', error);
                alert('Ошибка при удалении пользователя');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData };
            if (editingUser && !data.password) {
                delete data.password;
            }

            // Clean up empty foreign keys
            if (data.department === '') data.department = null;
            if (data.supervisor === '') data.supervisor = null;

            if (editingUser) {
                await api.put(`/users/manage/${editingUser.id}/`, data);
            } else {
                await api.post('/users/manage/', data);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save user', error);
            const errorMsg = error.response?.data
                ? Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join('\n')
                : 'Ошибка при сохранении пользователя';
            alert(errorMsg);
        }
    };

    if (loading) return <div className="p-6 text-gray-500">Загрузка...</div>;

    if (currentUser.role !== 'admin') {
        return <div className="p-6 text-red-500">Доступ запрещен. Только для администраторов.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Пользователи</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <UserPlus size={20} /> Добавить
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск пользователей..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ФИО</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Логин</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Роль</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Подразделение</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                                <td className="px-4 py-3 text-gray-600">{u.username}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        {roleOptions.find(r => r.value === u.role)?.label || u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{u.department_name || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(u)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-6 text-center text-gray-500">Пользователи не найдены</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Логин *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Пароль *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        required={!editingUser}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Фамилия *</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Имя *</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Отчество</label>
                                    <input
                                        type="text"
                                        value={formData.middle_name}
                                        onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Роль *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        {roleOptions.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Подразделение</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">Не выбрано</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Телефон</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">
                                    Отмена
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default Users;
