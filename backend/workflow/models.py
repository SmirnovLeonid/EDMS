from django.db import models
from django.conf import settings

class ApprovalRoute(models.Model):
    document_type = models.ForeignKey('documents.DocumentType', on_delete=models.CASCADE, related_name='routes', verbose_name='Тип документа')
    step_order = models.PositiveIntegerField(verbose_name='Порядковый номер шага')
    approver_role = models.CharField(max_length=50, verbose_name='Роль согласующего', help_text='Код роли (например, dept_head, prorector)')
    
    class Meta:
        verbose_name = 'Маршрут согласования'
        verbose_name_plural = 'Маршруты согласования'
        ordering = ['step_order']


class ActionLog(models.Model):
    ACTION_CHOICES = (
        ('created', 'Создан'),
        ('registered', 'Зарегистрирован'),
        ('submitted', 'Отправлен на согласование'),
        ('approved', 'Согласован'),
        ('rejected', 'Отклонен'),
        ('assigned', 'Назначен исполнитель'),
        ('accepted', 'Принят к исполнению'),
        ('completed', 'Исполнен'),
        ('returned', 'Возвращен на доработку'),
        ('archived', 'Архивирован'),
        ('commented', 'Добавлен комментарий'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Пользователь')
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE, related_name='logs', verbose_name='Документ')
    assignment = models.ForeignKey('documents.DocumentAssignment', on_delete=models.CASCADE, null=True, blank=True, related_name='logs', verbose_name='Назначение')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name='Действие')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    file = models.FileField(upload_to='action_logs/%Y/%m/%d/', blank=True, null=True, verbose_name='Прикрепленный файл')
    signature = models.CharField(max_length=255, blank=True, verbose_name='Подпись (хэш)')
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата подписи')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Время')

    class Meta:
        verbose_name = 'Журнал действий'
        verbose_name_plural = 'Журналы действий'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.get_action_display()} - {self.document}"
