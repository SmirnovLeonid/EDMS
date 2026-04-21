from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta

from documents.models import Document, DocumentAssignment, Department
from workflow.models import ActionLog

class KPIAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        
        # 1. Overdue documents
        overdue_documents = Document.objects.filter(
            deadline__lt=now.date(),
            status__in=['draft', 'pending', 'in_progress', 'approved']
        ).count()
        
        # 2. Employee load (active assignments)
        employee_load = DocumentAssignment.objects.filter(
            status__in=['pending', 'accepted', 'in_progress']
        ).count()
        
        # 3. Top active departments
        top_departments = Department.objects.annotate(
            doc_count=Count('employees__created_documents')
        ).order_by('-doc_count')[:5]
        departments_data = [{"name": d.name, "count": d.doc_count} for d in top_departments]

        # 4. Execution efficiency
        total_assignments = DocumentAssignment.objects.count()
        completed_assignments = DocumentAssignment.objects.filter(status='completed').count()
        efficiency = round((completed_assignments / total_assignments * 100), 2) if total_assignments > 0 else 0
        
        # 5. Average approval time (from creation to approval)
        approved_logs = ActionLog.objects.filter(action='approved').select_related('document').order_by('-timestamp')[:100]
        total_seconds = 0
        count = 0
        for log in approved_logs:
            doc = log.document
            if doc.created_at:
                delta = log.timestamp - doc.created_at
                total_seconds += delta.total_seconds()
                count += 1
        
        avg_approval_hours = round((total_seconds / count) / 3600, 1) if count > 0 else 0

        return Response({
            "average_approval_hours": avg_approval_hours,
            "overdue_documents": overdue_documents,
            "employee_load": employee_load,
            "top_departments": departments_data,
            "execution_efficiency": efficiency
        })


class HeatmapAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        logs = ActionLog.objects.filter(timestamp__gte=thirty_days_ago)
        
        activity = {}
        for log in logs:
            date_str = log.timestamp.strftime('%Y-%m-%d')
            activity[date_str] = activity.get(date_str, 0) + 1
            
        result = [{"date": k, "count": v} for k, v in activity.items()]
        result.sort(key=lambda x: x["date"])
        
        return Response(result)
