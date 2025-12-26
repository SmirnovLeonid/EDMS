from django.db import models
from django.conf import settings

class Department(models.Model):
    name = models.CharField(max_length=200, verbose_name='Название')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children', verbose_name='Родительское подразделение')
    head = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments', verbose_name='Руководитель')

    class Meta:
        verbose_name = 'Подразделение'
        verbose_name_plural = 'Подразделения'

    def __str__(self):
        return self.name

class DocumentType(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название типа')
    
    class Meta:
        verbose_name = 'Тип документа'
        verbose_name_plural = 'Типы документов'

    def __str__(self):
        return self.name

class Document(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Черновик'),
        ('pending', 'На согласовании'),
        ('in_progress', 'На исполнении'),
        ('approved', 'Утвержден'),
        ('rejected', 'Отклонен'),
        ('completed', 'Исполнен'),
        ('archived', 'Архив'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('urgent', 'Срочный'),
    )

    title = models.CharField(max_length=255, verbose_name='Заголовок')
    content = models.TextField(blank=True, verbose_name='Содержание')
    document_type = models.ForeignKey(DocumentType, on_delete=models.PROTECT, verbose_name='Тип документа')
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_documents', verbose_name='Создатель')
    current_approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents_to_approve', verbose_name='Текущий согласующий')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Статус')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='Приоритет')
    file = models.FileField(upload_to='documents/%Y/%m/%d/', blank=True, null=True, verbose_name='Файл')
    deadline = models.DateField(null=True, blank=True, verbose_name='Срок исполнения')
    registration_number = models.CharField(max_length=50, blank=True, verbose_name='Регистрационный номер')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Документ'
        verbose_name_plural = 'Документы'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.registration_number or 'Б/Н'} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.registration_number and self.status != 'draft':
            # Auto-generate registration number
            from django.utils import timezone
            current_year = timezone.now().year
            last_doc = Document.objects.exclude(registration_number='').order_by('-id').first()
            if last_doc and last_doc.registration_number:
                try:
                    last_num = int(last_doc.registration_number.split('-')[-1])
                    self.registration_number = f"{current_year}-{last_num + 1:05d}"
                except:
                    self.registration_number = f"{current_year}-00001"
            else:
                self.registration_number = f"{current_year}-00001"
        super().save(*args, **kwargs)


class DocumentAssignment(models.Model):
    """Assignment of document to executor"""
    STATUS_CHOICES = (
        ('pending', 'Ожидает'),
        ('accepted', 'Принято'),
        ('in_progress', 'В работе'),
        ('completed', 'Выполнено'),
        ('rejected', 'Отклонено'),
    )

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='assignments', verbose_name='Документ')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_documents', verbose_name='Исполнитель')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_assignments', verbose_name='Назначил')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    instruction = models.TextField(blank=True, verbose_name='Резолюция/Указание')
    deadline = models.DateField(null=True, blank=True, verbose_name='Срок исполнения')
    signature = models.CharField(max_length=255, blank=True, verbose_name='Подпись (хэш)')
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата подписи')
    response = models.TextField(blank=True, verbose_name='Ответ исполнителя')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата назначения')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Назначение документа'
        verbose_name_plural = 'Назначения документов'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document} -> {self.assignee}"


class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions', verbose_name='Документ')
    file = models.FileField(upload_to='documents/versions/%Y/%m/%d/', verbose_name='Файл версии')
    version_number = models.PositiveIntegerField(verbose_name='Номер версии')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Автор версии')

    class Meta:
        verbose_name = 'Версия документа'
        verbose_name_plural = 'Версии документов'
        ordering = ['-version_number']
