import os
import sys
import django
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from documents.models import Department, DocumentType, Document, DocumentAssignment
from workflow.models import ActionLog

User = get_user_model()

def clean_db():
    print("Cleaning database...")
    ActionLog.objects.all().delete()
    DocumentAssignment.objects.all().delete()
    Document.objects.all().delete()
    DocumentType.objects.all().delete()
    User.objects.exclude(is_superuser=True).delete() # Keep superuser if exists, or just delete all? User asked to "fill ... so no unclear ones". I'll delete all non-admin or maybe just all and recreate admin.
    # Actually, let's delete all users to be clean, but maybe keep superuser if it's the one running this? 
    # Let's delete all and recreate.
    User.objects.all().delete()
    Department.objects.all().delete()
    print("Database cleaned.")

def create_departments():
    print("Creating departments...")
    depts = {
        'rectorate': Department.objects.create(name='Ректорат'),
        'umu': Department.objects.create(name='Учебно-методическое управление'),
        'hr': Department.objects.create(name='Отдел кадров'),
        'accounting': Department.objects.create(name='Бухгалтерия'),
        'it_faculty': Department.objects.create(name='Факультет ИТ'),
        'admin_dept': Department.objects.create(name='Административный отдел'),
    }
    return depts

def create_users(depts):
    print("Creating users...")
    users = []
    password = 'qwer123!'

    # Admin
    admin = User.objects.create_superuser('admin', 'admin@example.com', password)
    admin.first_name = 'Админ'
    admin.last_name = 'Системный'
    admin.role = 'admin'
    admin.department = depts['admin_dept']
    admin.save()
    users.append(admin)

    # Rector
    rector = User.objects.create_user('rector', 'rector@example.com', password)
    rector.first_name = 'Иван'
    rector.last_name = 'Иванов'
    rector.middle_name = 'Иванович'
    rector.role = 'rector'
    rector.department = depts['rectorate']
    rector.position = 'Ректор'
    rector.save()
    users.append(rector)

    # Prorector
    prorector = User.objects.create_user('prorector', 'prorector@example.com', password)
    prorector.first_name = 'Петр'
    prorector.last_name = 'Петров'
    prorector.middle_name = 'Петрович'
    prorector.role = 'prorector'
    prorector.department = depts['rectorate']
    prorector.position = 'Проректор'
    prorector.save()
    users.append(prorector)

    # Dept Heads
    head_it = User.objects.create_user('head_it', 'head_it@example.com', password)
    head_it.first_name = 'Сергей'
    head_it.last_name = 'Сергеев'
    head_it.role = 'dept_head'
    head_it.department = depts['it_faculty']
    head_it.position = 'Декан'
    head_it.save()
    users.append(head_it)
    depts['it_faculty'].head = head_it
    depts['it_faculty'].save()

    head_hr = User.objects.create_user('head_hr', 'head_hr@example.com', password)
    head_hr.first_name = 'Анна'
    head_hr.last_name = 'Аннова'
    head_hr.role = 'dept_head'
    head_hr.department = depts['hr']
    head_hr.position = 'Начальник отдела'
    head_hr.save()
    users.append(head_hr)
    depts['hr'].head = head_hr
    depts['hr'].save()

    # Employees
    emp_it1 = User.objects.create_user('emp_it1', 'emp_it1@example.com', password)
    emp_it1.first_name = 'Алексей'
    emp_it1.last_name = 'Алексеев'
    emp_it1.role = 'employee'
    emp_it1.department = depts['it_faculty']
    emp_it1.position = 'Преподаватель'
    emp_it1.supervisor = head_it
    emp_it1.save()
    users.append(emp_it1)

    emp_hr1 = User.objects.create_user('emp_hr1', 'emp_hr1@example.com', password)
    emp_hr1.first_name = 'Мария'
    emp_hr1.last_name = 'Мариева'
    emp_hr1.role = 'employee'
    emp_hr1.department = depts['hr']
    emp_hr1.position = 'Специалист'
    emp_hr1.supervisor = head_hr
    emp_hr1.save()
    users.append(emp_hr1)

    secretary = User.objects.create_user('secretary', 'secretary@example.com', password)
    secretary.first_name = 'Елена'
    secretary.last_name = 'Еленова'
    secretary.role = 'secretary'
    secretary.department = depts['rectorate']
    secretary.position = 'Секретарь'
    secretary.save()
    users.append(secretary)

    return users

def create_document_types():
    print("Creating document types...")
    types = [
        'Приказ',
        'Распоряжение',
        'Служебная записка',
        'Заявление',
        'Протокол'
    ]
    doc_types = {}
    for t in types:
        doc_types[t] = DocumentType.objects.create(name=t)
    return doc_types

def create_documents(users, doc_types):
    print("Creating documents...")
    # Find specific users
    rector = next(u for u in users if u.username == 'rector')
    head_it = next(u for u in users if u.username == 'head_it')
    emp_it1 = next(u for u in users if u.username == 'emp_it1')
    
    # Doc 1: Order by Rector
    doc1 = Document.objects.create(
        title='О начале учебного года',
        content='Приказываю начать учебный год 1 сентября.',
        document_type=doc_types['Приказ'],
        creator=rector,
        status='approved',
        priority='high',
        registration_number='2024-00001'
    )
    
    # Doc 2: Memo from IT Head
    doc2 = Document.objects.create(
        title='О закупке оборудования',
        content='Прошу закупить новые компьютеры.',
        document_type=doc_types['Служебная записка'],
        creator=head_it,
        current_approver=rector,
        status='pending',
        priority='medium'
    )

    # Doc 3: Application from Employee
    doc3 = Document.objects.create(
        title='Заявление на отпуск',
        content='Прошу предоставить отпуск.',
        document_type=doc_types['Заявление'],
        creator=emp_it1,
        current_approver=head_it,
        status='pending',
        priority='low'
    )

def generate_user_list_file(users):
    print("Generating user list file...")
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'users_list.txt')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(f"{'Username':<20} | {'Role':<15} | {'Full Name':<40} | {'Password'}\n")
        f.write("-" * 100 + "\n")
        for user in users:
            full_name = f"{user.last_name} {user.first_name} {user.middle_name}".strip()
            f.write(f"{user.username:<20} | {user.role:<15} | {full_name:<40} | qwer123!\n")
    print(f"User list saved to {file_path}")

if __name__ == '__main__':
    clean_db()
    depts = create_departments()
    users = create_users(depts)
    doc_types = create_document_types()
    create_documents(users, doc_types)
    generate_user_list_file(users)
    print("Done!")
