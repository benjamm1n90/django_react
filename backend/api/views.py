from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import EstimatorSerializer, UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Estimator
from .services import calculate_price

class NoteListCreate(generics.ListCreateAPIView):
    """List/create notes scoped to a single estimate, e.g.
    /api/estimates/<estimate_id>/notes/. Notes always belong to an estimate
    owned by the requesting user; 404s if the estimate doesn't exist or
    belongs to someone else, rather than leaking which estimate IDs exist."""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_estimate(self):
        return get_object_or_404(
            Estimator, pk=self.kwargs['estimate_id'], user=self.request.user
        )

    def get_queryset(self):
        estimate = self.get_estimate()
        return Note.objects.filter(author=self.request.user, estimate=estimate)

    def perform_create(self, serializer):
        estimate = self.get_estimate()
        serializer.save(author=self.request.user, estimate=estimate)

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
    
class UpdateEstimate(generics.UpdateAPIView):
    serializer_class = EstimatorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Estimator.objects.filter(user=user)
    
    def perform_update(self, serializer):
        # On a partial update (PATCH), fields the client didn't send are not
        # present in validated_data, so fall back to the existing instance
        # values instead of passing None into calculate_price.
        instance = serializer.instance
        square_feet = serializer.validated_data.get('square_footage', instance.square_footage)
        pounds = serializer.validated_data.get('pound_estimate', instance.pound_estimate)
        crew_size = serializer.validated_data.get('crew_size', instance.crew_size)

        price = calculate_price(square_feet, pounds, crew_size)

        serializer.save(price=price)


