from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from documents.models import Document, DocumentType, Department
from workflow.models import ApprovalRoute, ActionLog
from django.core.files.base import ContentFile

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the full workflow'

    def handle(self, *args, **options):
        self.stdout.write('Starting workflow test...')
        
        # 1. Setup Users
        admin, _ = User.objects.get_or_create(username='admin', role='admin')
        dept_head, _ = User.objects.get_or_create(username='head', role='dept_head')
        employee, _ = User.objects.get_or_create(username='emp', role='employee')
        
        self.stdout.write('Users created.')

        # 2. Setup Document Type and Route
        doc_type, _ = DocumentType.objects.get_or_create(name='Memo')
        
        # Route: Step 1 -> Dept Head
        ApprovalRoute.objects.get_or_create(
            document_type=doc_type,
            step_order=1,
            approver_role='dept_head'
        )
        
        self.stdout.write('Routes configured.')

        # 3. Create Document (as Employee)
        doc = Document.objects.create(
            title='Test Memo',
            document_type=doc_type,
            creator=employee,
            status='draft'
        )
        doc.file.save('test.txt', ContentFile('content'))
        doc.save()
        
        self.stdout.write(f'Document created: {doc}')

        # 4. Submit Document
        # Simulate view logic
        first_route = ApprovalRoute.objects.filter(document_type=doc.document_type).order_by('step_order').first()
        approver = User.objects.filter(role=first_route.approver_role).first()
        
        doc.status = 'pending'
        doc.current_approver = approver
        doc.save()
        
        ActionLog.objects.create(user=employee, document=doc, action='submitted')
        
        self.stdout.write(f'Document submitted. Status: {doc.status}, Approver: {doc.current_approver}')
        
        assert doc.status == 'pending'
        assert doc.current_approver == dept_head

        # 5. Approve Document (as Dept Head)
        # Simulate view logic
        routes = list(ApprovalRoute.objects.filter(document_type=doc.document_type).order_by('step_order'))
        current_step_index = 0 # We know it's step 0
        
        next_step_index = current_step_index + 1
        if next_step_index < len(routes):
            pass # Move to next
        else:
            doc.status = 'approved'
            doc.current_approver = None
            doc.save()
        
        ActionLog.objects.create(user=dept_head, document=doc, action='approved')

        self.stdout.write(f'Document approved. Status: {doc.status}')
        
        assert doc.status == 'approved'
        assert doc.current_approver is None
        
        self.stdout.write(self.style.SUCCESS('Workflow test passed successfully!'))
