from django.db import models
from users.models import Member

# Create your models here.

class AuthToken(models.Model):
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='auth_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Token for {self.user.email}"

    class Meta:
        db_table = 'auth_app_authtoken'
