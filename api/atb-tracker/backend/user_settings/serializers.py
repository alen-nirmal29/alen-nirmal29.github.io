from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    avatar_url = serializers.SerializerMethodField()
    website = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'first_name', 'last_name', 'email', 'avatar_url', 'avatar',
            'phone', 'job_title', 'company', 'bio', 'location', 'website', 'timezone'
        ]

    def validate_website(self, value):
        """
        Automatically add 'https://' to the URL if it's missing a scheme.
        """
        if value and '://' not in value:
            return f'https://{value}'
        return value

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        # If the user logged in with Google and has a picture URL, use it
        if obj.user.provider == 'google' and obj.user.picture:
            return obj.user.picture
        # Otherwise, if they have a locally uploaded avatar, build its full URL
        if obj.avatar and hasattr(obj.avatar, 'url'):
            # Make sure we have a request object to build the full URL
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def update(self, instance, validated_data):
        # Pop the nested 'user' data. If it doesn't exist, default to an empty dict.
        user_data = validated_data.pop('user', {})

        # Update the related User (Member) model fields if any were provided
        if user_data:
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.save()

        # Update the UserProfile model fields.
        # The remaining items in validated_data are for the UserProfile.
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
