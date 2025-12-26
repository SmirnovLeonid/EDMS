from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovalRouteViewSet, ActionLogViewSet, StatisticsView

router = DefaultRouter()
router.register(r'routes', ApprovalRouteViewSet)
router.register(r'logs', ActionLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
]
