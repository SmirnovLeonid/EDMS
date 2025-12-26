from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True, allow_null=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'middle_name', 'full_name', 'email', 'role', 'role_display', 'department', 'department_name', 'position', 'phone', 'supervisor', 'supervisor_name']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'role', 'department', 'department_name']
