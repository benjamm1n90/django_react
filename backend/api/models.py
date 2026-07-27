from django.db import models
from django.contrib.auth.models import User

class Estimator(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='estimations')
    customer_name = models.CharField(max_length=100, default="Customer")
    square_footage = models.IntegerField()
    pound_estimate = models.IntegerField()
    crew_size = models.IntegerField()
    price = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Estimate by {self.user.username} : {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    # Notes are created via the "Add Notes" panel on a specific estimate.
    # Nullable so the migration adding this column doesn't require a default
    # for any pre-existing rows, but the app never creates a note without one.
    estimate = models.ForeignKey(
        Estimator, on_delete=models.CASCADE, related_name='notes', null=True, blank=True
    )

    def __str__(self):
        return self.title
# Create your models here.
