from rest_framework import generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, UserListSerializer
from .permissions import IsSystemAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSystemAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        department = self.request.query_params.get('department')
        role = self.request.query_params.get('role')
        
        if department:
            queryset = queryset.filter(department_id=department)
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset.order_by('last_name', 'first_name')


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """List users for assignment dropdowns"""
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        department = self.request.query_params.get('department')
        role = self.request.query_params.get('role')
        
        if department:
            queryset = queryset.filter(department_id=department)
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset.order_by('last_name', 'first_name')


class SubordinatesView(APIView):
    """Get subordinates of current user"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get direct subordinates
        subordinates = User.objects.filter(supervisor=user)
        # If user is dept head, also get department employees
        if user.role == 'dept_head' and user.department:
            dept_employees = User.objects.filter(department=user.department).exclude(id=user.id)
            subordinates = (subordinates | dept_employees).distinct()
        
        serializer = UserListSerializer(subordinates, many=True)
        return Response(serializer.data)
