from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Estimator, Note

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'author']
        extra_kwargs = {'author': {'read_only': True}}

class EstimatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estimator
        fields = ['id', 'user', 'customer_name', 'square_footage', 'pound_estimate', 'crew_size', 'price', 'created_at', 'updated_at']
        extra_kwargs = {'user': {'read_only': True}, 'price': {'read_only': True}, 'created_at': {'read_only': True}, 'updated_at': {'read_only': True}}