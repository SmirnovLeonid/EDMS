import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const ReportGenerator = () => {
    const [reportType, setReportType] = useState('documents');
    const [format, setFormat] = useState('pdf');

    const handleDownload = async () => {
        const url = `http://localhost:8000/api/reports/${reportType}/?export_format=${format}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (!res.ok) throw new Error('Ошибка генерации отчета');

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${reportType}_report.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Download error:', error);
            alert('Ошибка при скачивании отчета. Проверьте консоль.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Генератор отчетов</h1>

            <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl space-y-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-3">Тип данных для отчета</label>
                        <div className="space-y-3">
                            <ReportOption value="documents" current={reportType} set={setReportType} label="Отчет по документам" desc="Список всех документов с их статусами" />
                            <ReportOption value="assignments" current={reportType} set={setReportType} label="Отчет по поручениям" desc="Анализ назначенных задач и исполнителей" />
                            <ReportOption value="departments" current={reportType} set={setReportType} label="Отчет по подразделениям" desc="Структура компании и руководители" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-3">Формат выгрузки</label>
                        <div className="space-y-3">
                            <FormatOption value="pdf" current={format} set={setFormat} label="PDF Документ" icon={FileText} color="text-red-600" />
                            <FormatOption value="xlsx" current={format} set={setFormat} label="Excel Таблица" icon={FileSpreadsheet} color="text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button onClick={handleDownload} className="w-full flex justify-center gap-2 items-center px-6 py-4 rounded-xl transition-all shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20 font-bold text-lg">
                        <Download size={24} /> Сгенерировать и скачать
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportOption = ({ value, current, set, label, desc }) => (
    <div onClick={() => set(value)} className={`p-4 rounded-xl border cursor-pointer transition-all ${current === value ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
        <div className="font-medium text-slate-800">{label}</div>
        <div className="text-sm text-indigo-600 mt-1">{desc}</div>
    </div>
);

const FormatOption = ({ value, current, set, label, icon: Icon, color }) => (
    <div onClick={() => set(value)} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${current === value ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
        <Icon className={color} size={24} />
        <div className="font-medium text-slate-800">{label}</div>
    </div>
);

export default ReportGenerator;
