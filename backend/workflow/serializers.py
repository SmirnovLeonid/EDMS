from rest_framework import serializers
from .models import ApprovalRoute, ActionLog

class ApprovalRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalRoute
        fields = ['id', 'document_type', 'step_order', 'approver_role']


class ActionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, allow_null=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    assignment_info = serializers.SerializerMethodField()

    class Meta:
        model = ActionLog
        fields = [
            'id', 'user', 'user_name', 'document', 'assignment', 'assignment_info',
            'action', 'action_display', 'comment', 'file', 'signature', 'signed_at', 'timestamp'
        ]

    def get_assignment_info(self, obj):
        if obj.assignment:
            return {
                'id': obj.assignment.id,
                'assignee': obj.assignment.assignee.get_full_name() if obj.assignment.assignee else None,
                'status': obj.assignment.get_status_display()
            }
        return None
