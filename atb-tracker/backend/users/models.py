from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password

class MemberManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Member(AbstractUser):
    # Override username field to use email
    username = None
    email = models.EmailField(unique=True)
    
    # Custom fields
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    picture = models.URLField(max_length=500, null=True, blank=True)
    provider = models.CharField(max_length=50, default='email')  # 'email' or 'google'
    email_verified = models.BooleanField(default=False)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    work_hours = models.CharField(max_length=255, blank=True, null=True)
    access_rights = models.CharField(max_length=100, blank=True, null=True)
    groups = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    # Use custom manager
    objects = MemberManager()

    def __str__(self):
        return self.get_full_name() or self.email

    class Meta:
        db_table = 'users_member'
