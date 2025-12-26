from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
import hashlib

from .models import Department, DocumentType, Document, DocumentAssignment, DocumentVersion
from .serializers import (
    DepartmentSerializer, DocumentTypeSerializer, 
    DocumentSerializer, DocumentListSerializer, DocumentAssignmentSerializer
)
from workflow.models import ApprovalRoute, ActionLog

User = get_user_model()


def generate_signature(user, document, action_type):
    """Generate a simple signature hash"""
    data = f"{user.id}-{document.id}-{action_type}-{timezone.now().isoformat()}"
    return hashlib.sha256(data.encode()).hexdigest()[:32]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.all()

        # Filter by status
        doc_status = self.request.query_params.get('status')
        if doc_status:
            queryset = queryset.filter(status=doc_status)

        # Filter by type
        doc_type = self.request.query_params.get('type')
        if doc_type:
            queryset = queryset.filter(document_type_id=doc_type)

        # Filter by role-based access
        if user.role in ['admin', 'rector', 'secretary']:
            pass  # Full access
        elif user.role in ['prorector', 'dept_head']:
            # See docs they created, assigned to them, or in their department
            queryset = queryset.filter(
                Q(creator=user) |
                Q(current_approver=user) |
                Q(assignments__assignee=user) |
                Q(assignments__assigned_by=user) |
                Q(creator__department=user.department)
            ).distinct()
        else:
            # Regular employees see their own docs and assigned to them
            queryset = queryset.filter(
                Q(creator=user) |
                Q(assignments__assignee=user)
            ).distinct()

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        doc = serializer.save(creator=self.request.user)
        ActionLog.objects.create(
            user=self.request.user,
            document=doc,
            action='created',
            signature=generate_signature(self.request.user, doc, 'created'),
            signed_at=timezone.now()
        )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit document for approval"""
        document = self.get_object()
        if document.status != 'draft':
            return Response({'error': 'Документ не в статусе черновика'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if document has assignments (Direct Assignment Flow)
        first_route = None
        if document.assignments.exists():
            # If assigned, the assignee becomes the approver
            assignment = document.assignments.first()
            document.current_approver = assignment.assignee
            document.status = 'pending'
            msg = 'Документ отправлен на согласование исполнителю'
            action_type = 'submitted'
        else:
            # Route-based Flow
            routes = ApprovalRoute.objects.filter(document_type=document.document_type).order_by('step_order')
            first_route = routes.first()
            
            if first_route:
                approver = User.objects.filter(role=first_route.approver_role).first()
                document.current_approver = approver
                document.status = 'pending'
                msg = 'Документ отправлен на согласование'
                action_type = 'submitted'
            else:
                # No routes - auto approve
                document.status = 'approved'
                document.current_approver = None
                msg = 'Документ утвержден (маршруты не настроены)'
                action_type = 'approved'
        
        document.save()

        ActionLog.objects.create(
            user=request.user,
            document=document,
            action=action_type,
            comment=request.data.get('comment', msg),
            signature=generate_signature(request.user, document, action_type),
            signed_at=timezone.now()
        )
        
        return Response({'status': msg})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve document"""
        document = self.get_object()
        if document.status != 'pending':
            return Response({'error': 'Документ не на согласовании'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if this is a Direct Assignment Flow
        if document.assignments.exists():
            # In direct flow, approval by the assignee finalizes the document
            # Check if the current user is the assignee (or current_approver)
            is_assignee = document.assignments.filter(assignee=request.user).exists()
            
            if is_assignee or document.current_approver == request.user:
                document.status = 'in_progress'
                document.current_approver = None
                msg = 'Документ согласован и принят в работу'
            else:
                # Should not happen if logic is correct, but fallback
                document.status = 'in_progress'
                document.current_approver = None
                msg = 'Документ согласован'
        else:
            # Route-based Flow
            routes = list(ApprovalRoute.objects.filter(document_type=document.document_type).order_by('step_order'))
            
            # Determine current step based on user role or current_approver
            current_idx = -1
            for i, route in enumerate(routes):
                if route.approver_role == request.user.role:
                    current_idx = i
                    # If we found multiple steps with same role, we should ideally know which one we are at.
                    # For simplicity, we take the first one that matches the role if current_approver matches user
                    if document.current_approver == request.user:
                        break

            next_idx = current_idx + 1
            if next_idx < len(routes):
                next_route = routes[next_idx]
                next_approver = User.objects.filter(role=next_route.approver_role).first()
                document.current_approver = next_approver
                msg = 'Документ передан на следующий этап согласования'
            else:
                # Final approval
                document.status = 'approved'
                msg = 'Документ утвержден'
                document.current_approver = None

        document.save()

        # Handle file upload
        uploaded_file = request.FILES.get('file', None)
        
        ActionLog.objects.create(
            user=request.user,
            document=document,
            action='approved',
            comment=request.data.get('comment', msg),
            file=uploaded_file,
            signature=generate_signature(request.user, document, 'approved'),
            signed_at=timezone.now()
        )

        return Response({'status': msg})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject document"""
        document = self.get_object()
        if document.status != 'pending':
            return Response({'error': 'Документ не на согласовании'}, status=status.HTTP_400_BAD_REQUEST)

        document.status = 'rejected'
        document.current_approver = None
        document.save()

        # Handle file upload
        uploaded_file = request.FILES.get('file', None)
        
        ActionLog.objects.create(
            user=request.user,
            document=document,
            action='rejected',
            comment=request.data.get('comment', ''),
            file=uploaded_file,
            signature=generate_signature(request.user, document, 'rejected'),
            signed_at=timezone.now()
        )

        return Response({'status': 'Документ отклонен'})

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign document to executor"""
        document = self.get_object()
        
        assignee_id = request.data.get('assignee')
        instruction = request.data.get('instruction', '')
        deadline = request.data.get('deadline')

        if not assignee_id:
            return Response({'error': 'Не указан исполнитель'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            assignee = User.objects.get(id=assignee_id)
        except User.DoesNotExist:
            return Response({'error': 'Исполнитель не найден'}, status=status.HTTP_404_NOT_FOUND)

        assignment = DocumentAssignment.objects.create(
            document=document,
            assignee=assignee,
            assigned_by=request.user,
            instruction=instruction,
            deadline=deadline,
            signature=generate_signature(request.user, document, 'assigned'),
            signed_at=timezone.now()
        )

        # Update document status
        if document.status == 'approved':
            document.status = 'in_progress'
            document.save()

        ActionLog.objects.create(
            user=request.user,
            document=document,
            assignment=assignment,
            action='assigned',
            comment=f'Назначен исполнитель: {assignee.get_full_name()}. Резолюция: {instruction}',
            signature=generate_signature(request.user, document, 'assigned'),
            signed_at=timezone.now()
        )

        return Response(DocumentAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class DocumentAssignmentViewSet(viewsets.ModelViewSet):
    queryset = DocumentAssignment.objects.all()
    serializer_class = DocumentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = DocumentAssignment.objects.all()

        # Filter by document
        doc_id = self.request.query_params.get('document')
        if doc_id:
            queryset = queryset.filter(document_id=doc_id)

        # Filter by role
        if user.role in ['admin', 'rector', 'secretary']:
            pass
        elif user.is_manager():
            queryset = queryset.filter(
                Q(assignee=user) | Q(assigned_by=user) | Q(assignee__supervisor=user)
            )
        else:
            queryset = queryset.filter(assignee=user)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept assignment"""
        assignment = self.get_object()
        if assignment.status != 'pending':
            return Response({'error': 'Задание уже обработано'}, status=status.HTTP_400_BAD_REQUEST)

        assignment.status = 'accepted'
        assignment.signature = generate_signature(request.user, assignment.document, 'accepted')
        assignment.signed_at = timezone.now()
        assignment.save()

        ActionLog.objects.create(
            user=request.user,
            document=assignment.document,
            assignment=assignment,
            action='accepted',
            signature=assignment.signature,
            signed_at=assignment.signed_at
        )

        return Response({'status': 'Задание принято к исполнению'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark assignment as completed"""
        assignment = self.get_object()
        if assignment.status not in ['pending', 'accepted', 'in_progress']:
            return Response({'error': 'Задание уже завершено'}, status=status.HTTP_400_BAD_REQUEST)

        assignment.status = 'completed'
        assignment.response = request.data.get('response', '')
        assignment.signature = generate_signature(request.user, assignment.document, 'completed')
        assignment.signed_at = timezone.now()
        assignment.save()

        ActionLog.objects.create(
            user=request.user,
            document=assignment.document,
            assignment=assignment,
            action='completed',
            comment=assignment.response,
            signature=assignment.signature,
            signed_at=assignment.signed_at
        )

        # Check if all assignments are completed
        document = assignment.document
        pending_assignments = document.assignments.exclude(status='completed').count()
        if pending_assignments == 0 and document.status in ['in_progress', 'approved']:
            document.status = 'completed'
            document.save()

        return Response({'status': 'Задание выполнено'})
