from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import EstimatorSerializer, UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Estimator
from .services import calculate_price

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class EstimateListCreate(generics.ListCreateAPIView):
    serializer_class = EstimatorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Estimator.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        customer_name = serializer.validated_data['customer_name']
        square_feet = serializer.validated_data['square_footage']
        pounds = serializer.validated_data['pound_estimate']
        crew_number = serializer.validated_data['crew_size']

        price = calculate_price(square_feet, pounds, crew_number)

        serializer.save(user=self.request.user, price=price)

class DeleteEstimate(generics.DestroyAPIView):
    serializer_class = EstimatorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Estimator.objects.filter(user=user)


