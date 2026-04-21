from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Document, DocumentAssignment, Department
from .export_utils import generate_excel_report, generate_pdf_report

class DocumentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('export_format', 'pdf')
        docs = Document.objects.all()
        
        status = request.query_params.get('status')
        if status: docs = docs.filter(status=status)
            
        department_id = request.query_params.get('department')
        if department_id: docs = docs.filter(creator__department_id=department_id)

        columns = ['ID', 'Заголовок', 'Тип', 'Статус', 'Создатель', 'Дата создания']
        data = []
        for d in docs:
            data.append([
                d.id, d.title, d.document_type.name, d.get_status_display(), 
                d.creator.get_full_name() or d.creator.username, d.created_at.strftime('%Y-%m-%d')
            ])
            
        if fmt == 'xlsx':
            return generate_excel_report(data, 'documents_report', columns)
        return generate_pdf_report(data, 'documents_report', columns, 'Отчет по документам')

class AssignmentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('export_format', 'pdf')
        assigns = DocumentAssignment.objects.all()
        
        columns = ['ID', 'Документ', 'Исполнитель', 'Статус', 'Дедлайн']
        data = [[a.id, a.document.title, a.assignee.get_full_name() or a.assignee.username, a.get_status_display(), str(a.deadline)] for a in assigns]
        
        if fmt == 'xlsx':
            return generate_excel_report(data, 'assignments_report', columns)
        return generate_pdf_report(data, 'assignments_report', columns, 'Отчет по поручениям')

class DepartmentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('export_format', 'pdf')
        deps = Department.objects.all()
        
        columns = ['ID', 'Подразделение', 'Руководитель']
        data = [[d.id, d.name, d.head.get_full_name() if d.head else '-'] for d in deps]
        
        if fmt == 'xlsx':
            return generate_excel_report(data, 'departments_report', columns)
        return generate_pdf_report(data, 'departments_report', columns, 'Отчет по подразделениям')
