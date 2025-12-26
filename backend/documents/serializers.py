from rest_framework import serializers
from .models import Department, DocumentType, Document, DocumentAssignment, DocumentVersion
from users.serializers import UserListSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source='head.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'parent', 'head', 'head_name']


class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['id', 'name']


class DocumentVersionSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'file', 'version_number', 'created_at', 'creator', 'creator_name']


class DocumentAssignmentSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True)
    assignee_department = serializers.CharField(source='assignee.department.name', read_only=True, allow_null=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DocumentAssignment
        fields = [
            'id', 'document', 'assignee', 'assignee_name', 'assignee_department',
            'assigned_by', 'assigned_by_name', 'status', 'status_display',
            'instruction', 'deadline', 'signature', 'signed_at', 'response',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_by', 'signature', 'signed_at', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    type_name = serializers.CharField(source='document_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    current_approver_name = serializers.CharField(source='current_approver.get_full_name', read_only=True, allow_null=True)
    assignments = DocumentAssignmentSerializer(many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'content', 'document_type', 'type_name',
            'registration_number', 'creator', 'creator_name',
            'current_approver', 'current_approver_name',
            'status', 'status_display', 'priority', 'priority_display',
            'file', 'deadline', 'created_at', 'updated_at',
            'assignments', 'versions'
        ]
        read_only_fields = ['creator', 'registration_number', 'created_at', 'updated_at', 'status', 'current_approver']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['creator'] = user
        return super().create(validated_data)


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document lists"""
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    type_name = serializers.CharField(source='document_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assignment_count = serializers.IntegerField(source='assignments.count', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'registration_number', 'document_type', 'type_name',
            'creator', 'creator_name', 'status', 'status_display',
            'priority', 'priority_display', 'deadline', 'created_at', 'assignment_count'
        ]
