from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Member
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'password', 'firebase_uid', 'picture', 
                 'provider', 'email_verified', 'rate', 'cost', 'work_hours', 
                 'access_rights', 'groups', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': False},
            'email': {'required': True},
        }

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def create(self, validated_data):
        # Extract password and ensure it's properly hashed
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        
        # Create user with email as username
        user = Member.objects.create_user(
            email=email,
            password=password,
            **validated_data
        )
        return user

    def to_representation(self, instance):
        """Custom representation to include computed name field"""
        data = super().to_representation(instance)
        data['name'] = self.get_name(instance)
        return data
