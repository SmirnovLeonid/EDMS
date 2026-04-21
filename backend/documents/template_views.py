from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DocumentTemplate, Document, DocumentType
from django.utils import timezone

class TemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = DocumentTemplate.objects.all().values('id', 'name', 'type', 'template_text', 'created_at')
        return Response(list(templates))

    def post(self, request):
        data = request.data
        name = data.get('name')
        type_str = data.get('type')
        template_text = data.get('template_text')
        
        if not all([name, type_str, template_text]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        template = DocumentTemplate.objects.create(
            name=name,
            type=type_str,
            template_text=template_text,
            creator=request.user
        )
        return Response({"id": template.id, "message": "Template created"}, status=status.HTTP_201_CREATED)

class TemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            template = DocumentTemplate.objects.get(pk=pk)
            template.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DocumentTemplate.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class CreateFromTemplateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        template_id = data.get('template_id')
        title = data.get('title', 'Новый документ по шаблону')
        doc_type_id = data.get('document_type_id')

        if not template_id or not doc_type_id:
            return Response({"error": "Missing template_id or document_type_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            template = DocumentTemplate.objects.get(id=template_id)
            doc_type = DocumentType.objects.get(id=doc_type_id)
        except (DocumentTemplate.DoesNotExist, DocumentType.DoesNotExist):
            return Response({"error": "Template or DocumentType not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        text = template.template_text
        
        # Replace variables
        text = text.replace('{{ full_name }}', user.get_full_name() or user.username)
        text = text.replace('{{ department }}', user.department.name if user.department else "Не указано")
        text = text.replace('{{ position }}', user.position or "Не указано")
        text = text.replace('{{ date }}', timezone.now().strftime('%d.%m.%Y'))
        text = text.replace('{{ document_number }}', "[БУДЕТ ПРИСВОЕН ПОСЛЕ РЕГИСТРАЦИИ]")
        
        new_doc = Document.objects.create(
            title=title,
            content=text,
            document_type=doc_type,
            creator=user,
            status='draft'
        )
        
        return Response({
            "id": new_doc.id, 
            "message": "Document created from template",
            "content": text
        }, status=status.HTTP_201_CREATED)
