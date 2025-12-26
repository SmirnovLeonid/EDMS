from django.test import TestCase
from django.contrib.auth import get_user_model
from documents.models import Document, DocumentType, DocumentAssignment
from workflow.models import ApprovalRoute

User = get_user_model()

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

class DocumentFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create users
        self.creator = User.objects.create_user(username='creator', password='password', role='employee')
        self.dept_head = User.objects.create_user(username='head', password='password', role='dept_head')
        self.prorector = User.objects.create_user(username='prorector', password='password', role='prorector')
        self.assignee = User.objects.create_user(username='assignee', password='password', role='employee')

        # Create document type
        self.doc_type = DocumentType.objects.create(name='Memo')

        # Create approval route for Memo
        ApprovalRoute.objects.create(
            document_type=self.doc_type,
            step_order=1,
            approver_role='dept_head'
        )
        ApprovalRoute.objects.create(
            document_type=self.doc_type,
            step_order=2,
            approver_role='prorector'
        )

    def get_token_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}

    def test_route_based_flow(self):
        """Test standard approval flow based on routes"""
        # 1. Create document (no assignee)
        doc = Document.objects.create(
            title='Route Doc',
            document_type=self.doc_type,
            creator=self.creator,
            status='draft'
        )
        
        # 2. Submit
        headers = self.get_token_headers(self.creator)
        response = self.client.post(f'/api/documents/{doc.id}/submit/', **headers)
        self.assertEqual(response.status_code, 200)
        
        doc.refresh_from_db()
        self.assertEqual(doc.status, 'pending')
        self.assertEqual(doc.current_approver, self.dept_head)

        # 3. First Approval (Dept Head)
        headers = self.get_token_headers(self.dept_head)
        response = self.client.post(f'/api/documents/{doc.id}/approve/', **headers)
        self.assertEqual(response.status_code, 200)

        doc.refresh_from_db()
        self.assertEqual(doc.status, 'pending')
        self.assertEqual(doc.current_approver, self.prorector)

        # 4. Second Approval (Prorector)
        headers = self.get_token_headers(self.prorector)
        response = self.client.post(f'/api/documents/{doc.id}/approve/', **headers)
        self.assertEqual(response.status_code, 200)

        doc.refresh_from_db()
        self.assertEqual(doc.status, 'approved')
        self.assertIsNone(doc.current_approver)

    def test_direct_assignment_flow(self):
        """Test flow when specific assignee is selected"""
        # 1. Create document
        doc = Document.objects.create(
            title='Direct Doc',
            document_type=self.doc_type,
            creator=self.creator,
            status='draft'
        )
        
        # 2. Assign (simulates "Create and Assign")
        headers = self.get_token_headers(self.creator)
        self.client.post(f'/api/documents/{doc.id}/assign/', {
            'assignee': self.assignee.id,
            'instruction': 'Do this'
        }, **headers)

        # 3. Submit
        response = self.client.post(f'/api/documents/{doc.id}/submit/', **headers)
        self.assertEqual(response.status_code, 200)

        doc.refresh_from_db()
        self.assertEqual(doc.status, 'pending')
        # Should be assigned to the assignee, NOT the dept_head (route)
        self.assertEqual(doc.current_approver, self.assignee)

        # 4. Approve (Assignee accepts/approves)
        headers = self.get_token_headers(self.assignee)
        response = self.client.post(f'/api/documents/{doc.id}/approve/', **headers)
        self.assertEqual(response.status_code, 200)

        doc.refresh_from_db()
        # Should go to in_progress (accepted for work), skipping other route steps
        self.assertEqual(doc.status, 'in_progress')
        self.assertIsNone(doc.current_approver)
