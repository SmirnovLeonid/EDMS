from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from documents.models import Document, DocumentType, Department, DocumentAssignment
from workflow.models import ApprovalRoute, ActionLog
from django.core.files.base import ContentFile
from django.utils import timezone
import hashlib

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup test data for the EDMS system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up test data...')
        
        # 1. Create Departments
        rectorat, _ = Department.objects.get_or_create(name='Ректорат')
        it_dept, _ = Department.objects.get_or_create(name='IT Отдел', parent=rectorat)
        hr_dept, _ = Department.objects.get_or_create(name='Отдел кадров', parent=rectorat)
        faculty, _ = Department.objects.get_or_create(name='Факультет информатики')
        kafedra, _ = Department.objects.get_or_create(name='Кафедра ПО', parent=faculty)
        
        self.stdout.write('Departments created.')

        # 2. Create Users
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'role': 'admin', 'first_name': 'Администратор', 'last_name': 'Системы'}
        )
        admin.set_password('password')
        admin.save()

        rector, _ = User.objects.get_or_create(
            username='rector',
            defaults={'role': 'rector', 'first_name': 'Иван', 'last_name': 'Иванов', 'department': rectorat}
        )
        rector.set_password('password')
        rector.save()

        dept_head, _ = User.objects.get_or_create(
            username='head',
            defaults={'role': 'dept_head', 'first_name': 'Петр', 'last_name': 'Петров', 'department': it_dept}
        )
        dept_head.set_password('password')
        dept_head.save()

        employee1, _ = User.objects.get_or_create(
            username='emp1',
            defaults={'role': 'employee', 'first_name': 'Сергей', 'last_name': 'Сидоров', 'department': it_dept, 'supervisor': dept_head}
        )
        employee1.set_password('password')
        employee1.save()

        employee2, _ = User.objects.get_or_create(
            username='emp2',
            defaults={'role': 'employee', 'first_name': 'Анна', 'last_name': 'Козлова', 'department': hr_dept}
        )
        employee2.set_password('password')
        employee2.save()
        
        self.stdout.write('Users created.')

        # 3. Create Document Types
        memo, _ = DocumentType.objects.get_or_create(name='Служебная записка')
        order, _ = DocumentType.objects.get_or_create(name='Приказ')
        report, _ = DocumentType.objects.get_or_create(name='Отчет')
        
        self.stdout.write('Document types created.')

        # 4. Create Approval Routes
        ApprovalRoute.objects.get_or_create(document_type=memo, step_order=1, approver_role='dept_head')
        ApprovalRoute.objects.get_or_create(document_type=memo, step_order=2, approver_role='rector')
        
        ApprovalRoute.objects.get_or_create(document_type=order, step_order=1, approver_role='rector')
        
        self.stdout.write('Approval routes created.')

        # 5. Create sample documents
        doc1 = Document.objects.create(
            title='Заявка на закупку оборудования',
            content='Прошу рассмотреть заявку на закупку нового сервера для IT отдела.',
            document_type=memo,
            creator=employee1,
            status='draft',
            priority='medium',
            deadline=timezone.now().date() + timezone.timedelta(days=14)
        )
        ActionLog.objects.create(user=employee1, document=doc1, action='created', signature='test123')
        
        doc2 = Document.objects.create(
            title='Отчет о выполненной работе за ноябрь',
            content='Отчет по проекту внедрения ИС ЭДО.',
            document_type=report,
            creator=dept_head,
            status='pending',
            current_approver=rector,
            priority='high'
        )
        ActionLog.objects.create(user=dept_head, document=doc2, action='submitted', signature='test456')
        
        doc3 = Document.objects.create(
            title='Приказ о переводе сотрудника',
            content='Приказ о переводе Сидорова С.С. на новую должность.',
            document_type=order,
            creator=hr_dept.employees.first() if hr_dept.employees.exists() else admin,
            status='approved',
            priority='medium'
        )
        
        # Create assignment for doc3
        assignment = DocumentAssignment.objects.create(
            document=doc3,
            assignee=employee1,
            assigned_by=dept_head,
            instruction='Подготовить документы для перевода',
            status='pending',
            deadline=timezone.now().date() + timezone.timedelta(days=7)
        )
        ActionLog.objects.create(user=dept_head, document=doc3, assignment=assignment, action='assigned', signature='test789')
        
        self.stdout.write('Sample documents created.')
        
        self.stdout.write(self.style.SUCCESS('Test data setup complete!'))
        self.stdout.write('')
        self.stdout.write('Available users:')
        self.stdout.write('  admin / password (Администратор)')
        self.stdout.write('  rector / password (Ректор)')
        self.stdout.write('  head / password (Руководитель IT отдела)')
        self.stdout.write('  emp1 / password (Сотрудник IT)')
        self.stdout.write('  emp2 / password (Сотрудник HR)')
