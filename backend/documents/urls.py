from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, DocumentTypeViewSet, DocumentViewSet, DocumentAssignmentViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'types', DocumentTypeViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'assignments', DocumentAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
