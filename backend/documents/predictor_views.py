from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .predictor import predict_overdue_documents, predict_overloaded_employees

class PredictOverdueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # We can protect this based on roles if necessary,
        # but UI handles role blocking.
        return Response(predict_overdue_documents())

class PredictOverloadedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(predict_overloaded_employees())
