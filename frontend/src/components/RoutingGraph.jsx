import React from 'react';

const RoutingGraph = ({ routes, documentTypes }) => {
    // Group routes by document type
    const routesByType = routes.reduce((acc, route) => {
        if (!acc[route.document_type]) acc[route.document_type] = [];
        acc[route.document_type].push(route);
        return acc;
    }, {});

    const roleLabels = {
        'dept_head': 'Рук. подр.',
        'prorector': 'Проректор',
        'rector': 'Ректор',
        'admin': 'Админ',
        'employee': 'Сотрудник',
        'secretary': 'Секретарь',
        'council_member': 'Ученый совет'
    };

    return (
        <div className="space-y-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {Object.entries(routesByType).map(([typeId, typeRoutes]) => {
                const typeName = documentTypes.find(t => t.id === parseInt(typeId))?.name || 'Тип ' + typeId;
                const sortedRoutes = [...typeRoutes].sort((a, b) => a.step_order - b.step_order);

                return (
                    <div key={typeId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
                            {typeName}
                        </h3>
                        <div className="relative flex items-center justify-start gap-4 overflow-x-auto pb-4">
                            {/* Start Node */}
                            <div className="flex flex-col items-center min-w-[120px]">
                                <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-700 font-bold shadow-sm">
                                    S
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Создание</span>
                            </div>

                            {sortedRoutes.map((route, index) => (
                                <React.Fragment key={route.id}>
                                    {/* Arrow */}
                                    <div className="flex items-center text-gray-300">
                                        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                                            <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    {/* Step Node */}
                                    <div className="flex flex-col items-center min-w-[140px]">
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 border-2 border-blue-500 flex items-center justify-center text-blue-700 font-bold shadow-md transition-transform hover:scale-105">
                                            {route.step_order}
                                        </div>
                                        <div className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-sm">
                                            {roleLabels[route.approver_role] || route.approver_role}
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}

                            {/* End Node */}
                            <div className="flex items-center text-gray-300">
                                <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                                    <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-center min-w-[120px]">
                                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-700 font-bold shadow-sm">
                                    E
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Завершено</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {Object.keys(routesByType).length === 0 && (
                <div className="text-center py-12 text-gray-400 italic">
                    Маршруты не настроены. Добавьте шаги согласования выше.
                </div>
            )}
        </div>
    );
};

export default RoutingGraph;
