from rest_framework import serializers
from .models import Project, Client, Task, TimeEntry, Tag

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'project', 'assigned_to', 'created_at', 'updated_at']

class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'project', 'description', 'start_time', 'end_time', 'duration', 'date', 'billable', 'type', 'created_at', 'updated_at'
        ]

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'client', 'client_name', 'status', 'progress', 'tags']

    def create(self, validated_data):
        client_name = validated_data.pop('client_name', None)
        
        # Handle client creation if client_name is provided
        if client_name and client_name.strip():
            # Check if client exists for this user
            client, created = Client.objects.get_or_create(
                name=client_name.strip(),
                user=self.context['request'].user,
                defaults={'name': client_name.strip()}
            )
            validated_data['client'] = client
        else:
            validated_data['client'] = None
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        client_name = validated_data.pop('client_name', None)
        
        # Handle client creation if client_name is provided
        if client_name and client_name.strip():
            # Check if client exists for this user
            client, created = Client.objects.get_or_create(
                name=client_name.strip(),
                user=self.context['request'].user,
                defaults={'name': client_name.strip()}
            )
            validated_data['client'] = client
        elif client_name == '':
            validated_data['client'] = None
            
        return super().update(instance, validated_data)
