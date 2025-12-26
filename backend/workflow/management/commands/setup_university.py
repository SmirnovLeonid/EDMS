from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from documents.models import Document, DocumentType, Department
from workflow.models import ApprovalRoute

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup full university hierarchy based on org chart'

    def handle(self, *args, **options):
        self.stdout.write('Создание структуры ВУЗа...\n')
        
        # Clear existing data (order matters for foreign keys)
        from workflow.models import ActionLog
        from documents.models import DocumentAssignment, DocumentVersion
        
        ActionLog.objects.all().delete()
        DocumentAssignment.objects.all().delete()
        DocumentVersion.objects.all().delete()
        Document.objects.all().delete()
        ApprovalRoute.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        Department.objects.all().delete()
        
        # ============ DEPARTMENTS ============
        self.stdout.write('Создание подразделений...')
        
        # Level 0: Rector
        rectorat = Department.objects.create(name='01. Ректорат')
        
        # Level 1: Main divisions
        ucheniy_sovet = Department.objects.create(name='02. Ученый совет', parent=rectorat)
        apparat_rectora = Department.objects.create(name='03. Аппарат ректора', parent=rectorat)
        
        # Level 2: Pro-rectors
        prorector_04 = Department.objects.create(name='04. Проректор по международному сотрудничеству', parent=rectorat)
        prorector_05 = Department.objects.create(name='05. Проректор по академическим вопросам', parent=rectorat)
        prorector_06 = Department.objects.create(name='06. Проректор по научной работе и инновациям', parent=rectorat)
        prorector_08 = Department.objects.create(name='08. Проректор по социальным вопросам', parent=rectorat)
        prorector_09 = Department.objects.create(name='09. Проректор по АХЧ', parent=rectorat)
        
        # Departments under Apparat Rectora (03)
        kadrovaya = Department.objects.create(name='03.1 Кадровая служба', parent=apparat_rectora)
        obespechenie = Department.objects.create(name='03.2 Служба документационного обеспечения', parent=apparat_rectora)
        archive = Department.objects.create(name='03.3 Архив', parent=apparat_rectora)
        yurist = Department.objects.create(name='03.4 Юрисконсульт', parent=apparat_rectora)
        
        # Departments under Prorector 04
        strategic = Department.objects.create(name='04.1 Департамент стратегического развития', parent=prorector_04)
        career = Department.objects.create(name='04.1.1 Центр карьеры и профессионального развития', parent=strategic)
        international = Department.objects.create(name='04.2 Центр международных программ', parent=prorector_04)
        hr_dept = Department.objects.create(name='07. Департамент управления человеческими ресурсами', parent=prorector_04)
        accounting = Department.objects.create(name='10. Бухгалтерия', parent=prorector_04)
        digital_center = Department.objects.create(name='11. Центр управления цифровой трансформацией', parent=prorector_04)
        it_analytics = Department.objects.create(name='11.1 Служба IT-Аналитики', parent=digital_center)
        it_technologies = Department.objects.create(name='11.2 Служба цифровых технологий', parent=digital_center)
        library = Department.objects.create(name='12. Библиотека', parent=prorector_04)
        typography = Department.objects.create(name='13. Типография', parent=prorector_04)
        
        # Departments under Prorector 05 (Academic)
        academic_dev = Department.objects.create(name='05.1 Департамент академического развития', parent=prorector_05)
        education_dept = Department.objects.create(name='05.2 Департамент образования и обучения', parent=prorector_05)
        student_service = Department.objects.create(name='05.2.2 Служба студенческого обслуживания', parent=education_dept)
        methodology = Department.objects.create(name='05.3 Учебно-методический совет', parent=prorector_05)
        distant_center = Department.objects.create(name='05.4 Центр повышения квалификации', parent=prorector_05)
        edu_tech = Department.objects.create(name='05.5 Центр учебного телевидения', parent=prorector_05)
        
        # Departments under Prorector 06 (Science)
        science_institute = Department.objects.create(name='06.1 Научно-исследовательский институт', parent=prorector_06)
        social_lab = Department.objects.create(name='06.1.1 Лаборатория социальных исследований', parent=science_institute)
        legal_lab = Department.objects.create(name='06.1.2 Лаборатория правовых исследований', parent=science_institute)
        eco_lab = Department.objects.create(name='06.1.3 Лаборатория экономических исследований', parent=science_institute)
        tech_lab = Department.objects.create(name='06.1.4 Научно-производственная лаборатория', parent=science_institute)
        science_center = Department.objects.create(name='06.2 Центр развития научных исследований', parent=prorector_06)
        
        # Departments under Prorector 08 (Social)
        innovation_center = Department.objects.create(name='08.1 Центр воспитания и инноваций', parent=prorector_08)
        culture_house = Department.objects.create(name='08.2 Дворец культуры студентов', parent=prorector_08)
        dormitory = Department.objects.create(name='08.3 Общежитие', parent=prorector_08)
        business_incubator = Department.objects.create(name='08.3 Зона отдыха "Коненератор"', parent=prorector_08)
        
        # Departments under Prorector 09 (AHC)
        admin_dept = Department.objects.create(name='09.1 Административно-хозяйственный отдел', parent=prorector_09)
        commission = Department.objects.create(name='14. Приемная комиссия', parent=prorector_09)
        security = Department.objects.create(name='15. Служба безопасности', parent=prorector_09)
        civil_defense = Department.objects.create(name='16. Штаб гражданской обороны', parent=prorector_09)
        press = Department.objects.create(name='17. Пресс-секретарь', parent=prorector_09)
        prof_work = Department.objects.create(name='18. Центр профориентационной работы', parent=prorector_09)
        quality = Department.objects.create(name='19. Центр качества и аккредитации', parent=prorector_09)
        medical = Department.objects.create(name='20. Медпункт', parent=prorector_09)
        
        # Faculties and Kafedras
        faculty_eco = Department.objects.create(name='20. Факультет экономики', parent=prorector_05)
        kafedra_accounting = Department.objects.create(name='20.1 Кафедра бухгалтерского учета', parent=faculty_eco)
        kafedra_marketing = Department.objects.create(name='20.2 Кафедра маркетинга и логистики', parent=faculty_eco)
        kafedra_finance = Department.objects.create(name='20.3 Кафедра финансов', parent=faculty_eco)
        kafedra_higher_math = Department.objects.create(name='20.4 Кафедра высшей математики', parent=faculty_eco)
        kafedra_info = Department.objects.create(name='20.5 Кафедра информатики', parent=faculty_eco)
        
        faculty_law = Department.objects.create(name='21. Факультет права', parent=prorector_05)
        kafedra_state_law = Department.objects.create(name='21.1 Кафедра государственного права', parent=faculty_law)
        kafedra_civil_law = Department.objects.create(name='21.2 Кафедра гражданского права', parent=faculty_law)
        kafedra_criminal = Department.objects.create(name='21.3 Кафедра уголовного права', parent=faculty_law)
        
        faculty_tourism = Department.objects.create(name='22. Факультет туризма и сервиса', parent=prorector_05)
        kafedra_tourism = Department.objects.create(name='22.1 Кафедра туризма', parent=faculty_tourism)
        kafedra_hospitality = Department.objects.create(name='22.2 Кафедра гостеприимства', parent=faculty_tourism)
        
        faculty_distant = Department.objects.create(name='23. Факультет дистанционного обучения', parent=prorector_05)
        
        college = Department.objects.create(name='25. Колледж экономики, бизнеса и права', parent=rectorat)
        
        self.stdout.write(self.style.SUCCESS(f'Создано {Department.objects.count()} подразделений'))
        
        # ============ USERS ============
        self.stdout.write('\nСоздание пользователей...')
        
        # Admin
        admin = User.objects.create_user('admin', 'admin@university.kz', 'password', 
            first_name='Администратор', last_name='Системы', role='admin')
        
        # Rector
        rector = User.objects.create_user('rector', 'rector@university.kz', 'password',
            first_name='Ерик', last_name='Аймагамбетов', middle_name='Бикенович',
            role='rector', department=rectorat, position='Ректор')
        rectorat.head = rector
        rectorat.save()
        
        # Pro-rectors (all report to Rector)
        prorector1 = User.objects.create_user('prorector_intl', 'prorector1@university.kz', 'password',
            first_name='Алексей', last_name='Волков', role='prorector', 
            department=prorector_04, position='Проректор по международ. сотр.', supervisor=rector)
        prorector_04.head = prorector1
        prorector_04.save()
        
        prorector2 = User.objects.create_user('prorector_acad', 'prorector2@university.kz', 'password',
            first_name='Мария', last_name='Смирнова', role='prorector',
            department=prorector_05, position='Проректор по академическим вопросам', supervisor=rector)
        prorector_05.head = prorector2
        prorector_05.save()
        
        prorector3 = User.objects.create_user('prorector_sci', 'prorector3@university.kz', 'password',
            first_name='Дмитрий', last_name='Иванов', role='prorector',
            department=prorector_06, position='Проректор по научной работе', supervisor=rector)
        prorector_06.head = prorector3
        prorector_06.save()
        
        prorector4 = User.objects.create_user('prorector_social', 'prorector4@university.kz', 'password',
            first_name='Елена', last_name='Петрова', role='prorector',
            department=prorector_08, position='Проректор по социальным вопросам', supervisor=rector)
        prorector_08.head = prorector4
        prorector_08.save()
        
        prorector5 = User.objects.create_user('prorector_ahc', 'prorector5@university.kz', 'password',
            first_name='Сергей', last_name='Козлов', role='prorector',
            department=prorector_09, position='Проректор по АХЧ', supervisor=rector)
        prorector_09.head = prorector5
        prorector_09.save()
        
        # Department Heads (report to Pro-rectors)
        head_hr = User.objects.create_user('head_hr', 'hr@university.kz', 'password',
            first_name='Анна', last_name='Сидорова', role='dept_head',
            department=hr_dept, position='Начальник отдела кадров', supervisor=prorector1)
        hr_dept.head = head_hr
        hr_dept.save()
        
        head_it = User.objects.create_user('head_it', 'it@university.kz', 'password',
            first_name='Павел', last_name='Новиков', role='dept_head',
            department=digital_center, position='Директор ЦЦТ', supervisor=prorector1)
        digital_center.head = head_it
        digital_center.save()
        
        head_library = User.objects.create_user('head_library', 'library@university.kz', 'password',
            first_name='Ольга', last_name='Морозова', role='dept_head',
            department=library, position='Директор библиотеки', supervisor=prorector1)
        library.head = head_library
        library.save()
        
        head_accounting = User.objects.create_user('head_accounting', 'accounting@university.kz', 'password',
            first_name='Татьяна', last_name='Федорова', role='dept_head',
            department=accounting, position='Главный бухгалтер', supervisor=prorector1)
        accounting.head = head_accounting
        accounting.save()
        
        # Faculty Deans (report to Academic Pro-rector)
        dean_eco = User.objects.create_user('dean_eco', 'eco@university.kz', 'password',
            first_name='Владимир', last_name='Орлов', role='dept_head',
            department=faculty_eco, position='Декан факультета экономики', supervisor=prorector2)
        faculty_eco.head = dean_eco
        faculty_eco.save()
        
        dean_law = User.objects.create_user('dean_law', 'law@university.kz', 'password',
            first_name='Игорь', last_name='Соколов', role='dept_head',
            department=faculty_law, position='Декан юридического факультета', supervisor=prorector2)
        faculty_law.head = dean_law
        faculty_law.save()
        
        dean_tourism = User.objects.create_user('dean_tourism', 'tourism@university.kz', 'password',
            first_name='Наталья', last_name='Белова', role='dept_head',
            department=faculty_tourism, position='Декан факультета туризма', supervisor=prorector2)
        faculty_tourism.head = dean_tourism
        faculty_tourism.save()
        
        # Kafedra Heads (report to Deans)
        head_kf_acc = User.objects.create_user('head_kf_accounting', 'kf_acc@university.kz', 'password',
            first_name='Андрей', last_name='Лебедев', role='dept_head',
            department=kafedra_accounting, position='Заведующий кафедрой', supervisor=dean_eco)
        kafedra_accounting.head = head_kf_acc
        kafedra_accounting.save()
        
        head_kf_info = User.objects.create_user('head_kf_info', 'kf_info@university.kz', 'password',
            first_name='Михаил', last_name='Васильев', role='dept_head',
            department=kafedra_info, position='Заведующий кафедрой информатики', supervisor=dean_eco)
        kafedra_info.head = head_kf_info
        kafedra_info.save()
        
        head_kf_state = User.objects.create_user('head_kf_state', 'kf_state@university.kz', 'password',
            first_name='Александр', last_name='Кузнецов', role='dept_head',
            department=kafedra_state_law, position='Заведующий кафедрой гос. права', supervisor=dean_law)
        kafedra_state_law.head = head_kf_state
        kafedra_state_law.save()
        
        # Employees (report to Kafedra Heads)
        emp1 = User.objects.create_user('teacher1', 'teacher1@university.kz', 'password',
            first_name='Сергей', last_name='Попов', role='employee',
            department=kafedra_info, position='Старший преподаватель', supervisor=head_kf_info)
        
        emp2 = User.objects.create_user('teacher2', 'teacher2@university.kz', 'password',
            first_name='Виктория', last_name='Михайлова', role='employee',
            department=kafedra_info, position='Преподаватель', supervisor=head_kf_info)
        
        emp3 = User.objects.create_user('teacher3', 'teacher3@university.kz', 'password',
            first_name='Денис', last_name='Григорьев', role='employee',
            department=kafedra_accounting, position='Доцент', supervisor=head_kf_acc)
        
        emp4 = User.objects.create_user('it_specialist', 'it_spec@university.kz', 'password',
            first_name='Артем', last_name='Захаров', role='employee',
            department=it_technologies, position='Системный администратор', supervisor=head_it)
        
        emp5 = User.objects.create_user('hr_specialist', 'hr_spec@university.kz', 'password',
            first_name='Юлия', last_name='Коваленко', role='employee',
            department=hr_dept, position='Специалист по кадрам', supervisor=head_hr)
        
        emp6 = User.objects.create_user('accountant1', 'acc1@university.kz', 'password',
            first_name='Екатерина', last_name='Николаева', role='employee',
            department=accounting, position='Бухгалтер', supervisor=head_accounting)
        
        # Secretary
        secretary = User.objects.create_user('secretary', 'secretary@university.kz', 'password',
            first_name='Ирина', last_name='Макарова', role='secretary',
            department=apparat_rectora, position='Секретарь ректора', supervisor=rector)
        
        self.stdout.write(self.style.SUCCESS(f'Создано {User.objects.count()} пользователей'))
        
        # ============ DOCUMENT TYPES ============
        self.stdout.write('\nСоздание типов документов...')
        
        memo = DocumentType.objects.create(name='Служебная записка')
        order = DocumentType.objects.create(name='Приказ')
        report = DocumentType.objects.create(name='Отчет')
        application = DocumentType.objects.create(name='Заявление')
        protocol = DocumentType.objects.create(name='Протокол')
        contract = DocumentType.objects.create(name='Договор')
        
        self.stdout.write(self.style.SUCCESS(f'Создано {DocumentType.objects.count()} типов документов'))
        
        # ============ APPROVAL ROUTES ============
        self.stdout.write('\nСоздание маршрутов согласования...')
        
        # Служебная записка: Сотрудник -> Зав.кафедрой -> Декан -> Проректор -> Ректор
        ApprovalRoute.objects.create(document_type=memo, step_order=1, approver_role='dept_head')
        ApprovalRoute.objects.create(document_type=memo, step_order=2, approver_role='prorector')
        ApprovalRoute.objects.create(document_type=memo, step_order=3, approver_role='rector')
        
        # Приказ: только Ректор
        ApprovalRoute.objects.create(document_type=order, step_order=1, approver_role='rector')
        
        # Отчет: Зав.кафедрой -> Декан
        ApprovalRoute.objects.create(document_type=report, step_order=1, approver_role='dept_head')
        
        # Заявление: Зав.кафедрой -> Проректор
        ApprovalRoute.objects.create(document_type=application, step_order=1, approver_role='dept_head')
        ApprovalRoute.objects.create(document_type=application, step_order=2, approver_role='prorector')
        
        # Договор: Проректор -> Ректор
        ApprovalRoute.objects.create(document_type=contract, step_order=1, approver_role='prorector')
        ApprovalRoute.objects.create(document_type=contract, step_order=2, approver_role='rector')
        
        self.stdout.write(self.style.SUCCESS(f'Создано {ApprovalRoute.objects.count()} маршрутов согласования'))
        
        # ============ OUTPUT ============
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('Структура ВУЗа создана успешно!'))
        self.stdout.write('='*60)
        
        self.stdout.write('\nТестовые аккаунты (пароль для всех: password):')
        self.stdout.write('-'*60)
        
        for u in User.objects.all().order_by('-role', 'last_name'):
            sup = u.supervisor.username if u.supervisor else '-'
            dept = u.department.name[:30] if u.department else '-'
            self.stdout.write(f'{u.username:20} | {u.get_role_display():25} | Рук: {sup}')
