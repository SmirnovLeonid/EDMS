from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Администратор'),
        ('rector', 'Ректор'),
        ('prorector', 'Проректор'),
        ('dept_head', 'Руководитель подразделения'),
        ('employee', 'Сотрудник'),
        ('secretary', 'Секретарь'),
        ('council_member', 'Член ученого совета'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee', verbose_name='Роль')
    middle_name = models.CharField(max_length=150, blank=True, verbose_name='Отчество')
    position = models.CharField(max_length=100, blank=True, verbose_name='Должность')
    department = models.ForeignKey('documents.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='employees', verbose_name='Подразделение')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates', verbose_name='Руководитель')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.last_name} {self.first_name} ({self.get_role_display()})"

    def get_full_name(self):
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()

    def is_manager(self):
        return self.role in ['rector', 'prorector', 'dept_head', 'admin']
