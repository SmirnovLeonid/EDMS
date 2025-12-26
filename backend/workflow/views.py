from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import ApprovalRoute, ActionLog
from .serializers import ApprovalRouteSerializer, ActionLogSerializer
from documents.models import Document, DocumentAssignment


class ApprovalRouteViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRoute.objects.all()
    serializer_class = ApprovalRouteSerializer
    permission_classes = [permissions.IsAuthenticated]


class ActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActionLog.objects.all()
    serializer_class = ActionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        return queryset.order_by('-timestamp')


class StatisticsView(APIView):
    """Statistics for admin dashboard"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ['admin', 'rector', 'prorector']:
            return Response({'error': 'Недостаточно прав'}, status=403)

        # Documents by status
        status_stats = Document.objects.values('status').annotate(count=Count('id'))
        
        # Documents by type
        type_stats = Document.objects.values('document_type__name').annotate(count=Count('id'))
        
        # Overdue documents
        today = timezone.now().date()
        overdue_docs = Document.objects.filter(
            deadline__lt=today,
            status__in=['pending', 'in_progress']
        ).count()
        
        # Assignments by status
        assignment_stats = DocumentAssignment.objects.values('status').annotate(count=Count('id'))
        
        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_logs = ActionLog.objects.filter(timestamp__gte=week_ago).values('action').annotate(count=Count('id'))
        
        # Documents created this month
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        docs_this_month = Document.objects.filter(created_at__gte=month_start).count()
        
        # Top executors (most completed assignments)
        top_executors = DocumentAssignment.objects.filter(
            status='completed'
        ).values('assignee__first_name', 'assignee__last_name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        # Monthly trends (last 6 months)
        monthly_trends = []
        for i in range(5, -1, -1):
            month_date = timezone.now() - timedelta(days=i*30)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i > 0:
                next_month = (month_date + timedelta(days=30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                next_month = timezone.now()
            count = Document.objects.filter(created_at__gte=month_start, created_at__lt=next_month).count()
            monthly_trends.append({
                'month': month_start.strftime('%b'),
                'count': count
            })

        # Completion rate
        total_docs = Document.objects.count()
        completed_docs = Document.objects.filter(status__in=['completed', 'approved']).count()
        completion_rate = round((completed_docs / total_docs * 100) if total_docs > 0 else 0, 1)

        return Response({
            'status_stats': list(status_stats),
            'type_stats': list(type_stats),
            'overdue_count': overdue_docs,
            'assignment_stats': list(assignment_stats),
            'recent_activity': list(recent_logs),
            'docs_this_month': docs_this_month,
            'top_executors': list(top_executors),
            'total_documents': Document.objects.count(),
            'total_assignments': DocumentAssignment.objects.count(),
            'monthly_trends': monthly_trends,
            'completion_rate': completion_rate,
        })
