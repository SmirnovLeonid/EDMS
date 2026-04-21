from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .analytics_views import KPIAnalyticsView, HeatmapAnalyticsView
from .template_views import TemplateListView, CreateFromTemplateView, TemplateDetailView
from .report_views import DocumentReportView, AssignmentReportView, DepartmentReportView
from .predictor_views import PredictOverdueView, PredictOverloadedView
from .views import DepartmentViewSet, DocumentTypeViewSet, DocumentViewSet, DocumentAssignmentViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'types', DocumentTypeViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'assignments', DocumentAssignmentViewSet)

urlpatterns = [
    path('analytics/kpi/', KPIAnalyticsView.as_view(), name='kpi-analytics'),
    path('analytics/heatmap/', HeatmapAnalyticsView.as_view(), name='heatmap-analytics'),
    path('templates/', TemplateListView.as_view(), name='templates-list'),
    path('templates/<int:pk>/', TemplateDetailView.as_view(), name='template-detail'),
    path('documents/from-template/', CreateFromTemplateView.as_view(), name='document-from-template'),
    path('reports/documents/', DocumentReportView.as_view(), name='report-documents'),
    path('reports/assignments/', AssignmentReportView.as_view(), name='report-assignments'),
    path('reports/departments/', DepartmentReportView.as_view(), name='report-departments'),
    path('predict/overdue/', PredictOverdueView.as_view(), name='predict-overdue'),
    path('predict/overloaded/', PredictOverloadedView.as_view(), name='predict-overloaded'),
    path('', include(router.urls)),
]
