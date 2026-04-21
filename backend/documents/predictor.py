from documents.models import Document, DocumentAssignment, Department
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count

User = get_user_model()

def get_employee_average_time(user):
    completed = DocumentAssignment.objects.filter(assignee=user, status='completed')
    if not completed.exists():
        return 1.0 
    
    total_days = 0
    count = 0
    for task in completed:
        if task.updated_at and task.created_at:
            delta = task.updated_at - task.created_at
            total_days += delta.days
            count += 1
    return total_days / count if count > 0 else 1.0

def predict_overdue_documents():
    active_assignments = DocumentAssignment.objects.filter(status__in=['pending', 'accepted', 'in_progress'])
    now = timezone.now().date()
    
    risky = []
    for assignment in active_assignments:
        if not assignment.deadline:
            continue
            
        remaining_days = (assignment.deadline - now).days
        avg_time = get_employee_average_time(assignment.assignee)
        
        if avg_time > remaining_days:
            risky.append({
                "assignment_id": assignment.id,
                "document_title": assignment.document.title,
                "assignee": assignment.assignee.get_full_name() or assignment.assignee.username,
                "deadline": str(assignment.deadline),
                "remaining_days": remaining_days,
                "avg_execution_time": round(avg_time, 1)
            })
    return list(sorted(risky, key=lambda x: x["remaining_days"]))

def predict_overloaded_employees():
    active_assignments = DocumentAssignment.objects.filter(status__in=['pending', 'accepted', 'in_progress'])
    user_counts = active_assignments.values('assignee').annotate(count=Count('id'))
    
    if not user_counts: 
        return []
    
    avg_active = sum(item['count'] for item in user_counts) / len(user_counts)
    
    overloaded = []
    for item in user_counts:
        if item['count'] > avg_active * 1.2: # Adding 20% tolerance to reduce noise
            user = User.objects.get(id=item['assignee'])
            overloaded.append({
                "employee_id": user.id,
                "name": user.get_full_name() or user.username,
                "department": user.department.name if user.department else "Н/Д",
                "active_tasks": item['count'],
                "average_system_load": round(avg_active, 1)
            })
    return list(sorted(overloaded, key=lambda x: x["active_tasks"], reverse=True))
