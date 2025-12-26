from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import MeView, UserListView, SubordinatesView, UserViewSet

router = DefaultRouter()
router.register(r'manage', UserViewSet, basename='user-manage')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('list/', UserListView.as_view(), name='user_list'),
    path('subordinates/', SubordinatesView.as_view(), name='user_subordinates'),
]
