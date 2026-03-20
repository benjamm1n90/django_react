from django.contrib import admin
from .models import Note, Estimator

class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    search_fields = ('title', 'content', 'author__username')

class EstimatorAdmin(admin.ModelAdmin):
    list_display = ('user', 'square_footage', 'pound_estimate', 'crew_size', 'price', 'created_at')
    search_fields = ('user__username',)

admin.site.register(Note, NoteAdmin)
admin.site.register(Estimator, EstimatorAdmin)