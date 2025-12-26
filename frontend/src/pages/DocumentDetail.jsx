import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X, Send, FileText, UserPlus, Clock, History } from 'lucide-react';

const DocumentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [document, setDocument] = useState(null);
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Assign form state
    const [assignee, setAssignee] = useState('');
    const [instruction, setInstruction] = useState('');
    const [deadline, setDeadline] = useState('');

    // Approval modal state
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalComment, setApprovalComment] = useState('');
    const [approvalFile, setApprovalFile] = useState(null);
    const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [docRes, logsRes, usersRes] = await Promise.all([
                api.get(`/documents/${id}/`),
                api.get(`/workflow/logs/?document_id=${id}`),
                api.get('/users/list/')
            ]);
            setDocument(docRes.data);
            setLogs(logsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, data = {}) => {
        try {
            await api.post(`/documents/${id}/${action}/`, data);
            fetchData();
            alert('Действие выполнено');
        } catch (error) {
            alert(`Ошибка: ${error.response?.data?.error || 'Unknown'}`);
        }
    };

    const openApprovalModal = (action) => {
        setApprovalAction(action);
        setApprovalComment('');
        setApprovalFile(null);
        setShowApprovalModal(true);
    };

    const handleApprovalSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('comment', approvalComment);
            if (approvalFile) {
                formData.append('file', approvalFile);
            }

            await api.post(`/documents/${id}/${approvalAction}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowApprovalModal(false);
            fetchData();
            alert(approvalAction === 'approve' ? 'Документ согласован' : 'Документ отклонен');
        } catch (error) {
            alert(`Ошибка: ${error.response?.data?.error || 'Unknown'}`);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/documents/${id}/assign/`, {
                assignee,
                instruction,
                deadline: deadline || null
            });
            setShowAssignModal(false);
            setAssignee('');
            setInstruction('');
            setDeadline('');
            fetchData();
            alert('Исполнитель назначен');
        } catch (error) {
            alert(`Ошибка: ${error.response?.data?.error || 'Unknown'}`);
        }
    };

    if (loading) return <div className="p-6">Загрузка...</div>;
    if (!document) return <div className="p-6">Документ не найден</div>;

    const canSubmit = document.status === 'draft' && document.creator === user.id;
    const canApprove = document.status === 'pending' && (document.current_approver === user.id || user.role === 'admin');
    const canAssign = ['approved', 'in_progress'].includes(document.status) && user.is_manager;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
                <ArrowLeft size={20} className="mr-2" /> Назад
            </button>

            {/* Document header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">{document.registration_number || 'Без номера'}</div>
                        <h1 className="text-2xl font-bold text-gray-800">{document.title}</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            {document.type_name} | Создан: {new Date(document.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${document.status === 'approved' ? 'bg-green-100 text-green-700' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            document.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                document.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    document.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                                        'bg-gray-100 text-gray-700'
                        }`}>
                        {document.status_display}
                    </span>
                </div>

                {document.content && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Содержание</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{document.content}</p>
                    </div>
                )}

                {document.file && (
                    <div className="mb-4">
                        <a href={document.file} target="_blank" rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline">
                            <FileText size={18} className="mr-2" /> Скачать файл
                        </a>
                    </div>
                )}

                {document.deadline && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Clock size={16} className="mr-2" />
                        Срок исполнения: {document.deadline}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {canSubmit && (
                        <button
                            onClick={() => handleAction('submit')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Send size={18} /> Отправить на согласование
                        </button>
                    )}
                    {canApprove && (
                        <>
                            <button
                                onClick={() => openApprovalModal('approve')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Check size={18} /> Согласовать
                            </button>
                            <button
                                onClick={() => openApprovalModal('reject')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <X size={18} /> Отклонить
                            </button>
                        </>
                    )}
                    {canAssign && (
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <UserPlus size={18} /> Назначить исполнителя
                        </button>
                    )}
                </div>
            </div>

            {/* Assignments */}
            {document.assignments && document.assignments.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserPlus size={20} /> Исполнители ({document.assignments.length})
                    </h2>
                    <div className="space-y-4">
                        {document.assignments.map(a => (
                            <div key={a.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium">{a.assignee_name}</div>
                                        <div className="text-sm text-gray-500">{a.assignee_department}</div>
                                        {a.instruction && <div className="text-sm mt-2 bg-gray-50 p-2 rounded">{a.instruction}</div>}
                                        {a.response && <div className="text-sm mt-2 bg-green-50 p-2 rounded text-green-700">{a.response}</div>}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${a.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {a.status_display}
                                    </span>
                                </div>
                                {a.signature && (
                                    <div className="text-xs text-gray-400 mt-2">
                                        Подпись: {a.signature.substring(0, 16)}...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History size={20} /> История согласования
                </h2>
                <div className="space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-4 border-l-2 border-blue-200 pl-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{log.user_name || 'Система'}</span>
                                    <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-700">{log.action_display}</div>
                                {log.comment && <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{log.comment}</div>}
                                {log.file && (
                                    <a
                                        href={log.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:underline text-sm mt-2"
                                    >
                                        <FileText size={16} /> Прикрепленный файл
                                    </a>
                                )}
                                {log.signature && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        Подпись: {log.signature.substring(0, 16)}...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-500">История пуста</div>}
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Назначить исполнителя</h3>
                        <form onSubmit={handleAssign}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Исполнитель</label>
                                <select
                                    value={assignee}
                                    onChange={(e) => setAssignee(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                    required
                                >
                                    <option value="">Выберите...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.department_name || 'Без подразделения'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Резолюция / Указание</label>
                                <textarea
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Срок исполнения</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-600">
                                    Отмена
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Назначить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {approvalAction === 'approve' ? 'Согласование документа' : 'Отклонение документа'}
                        </h3>
                        <form onSubmit={handleApprovalSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Комментарий {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                    rows="3"
                                    placeholder={approvalAction === 'approve' ? 'Комментарий (опционально)' : 'Укажите причину отклонения'}
                                    required={approvalAction === 'reject'}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Прикрепить файл (опционально)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setApprovalFile(e.target.files[0])}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-gray-600">
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-lg ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {approvalAction === 'approve' ? 'Согласовать' : 'Отклонить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentDetail;
