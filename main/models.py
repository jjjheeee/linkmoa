# import uuid
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin

# class BaseTimeModel(models.Model):
#     createdAt = models.DateTimeField(auto_now_add=True)
#     updatedAt = models.DateTimeField(auto_now=True)
#     class Meta:
#         abstract = True
        
# Create your models here.
class UserManager(BaseUserManager):
    
    def create_user(self, email, password=None, **extra_fields):
        
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        
        # extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # extra_fields.setdefault('user_role', 2)
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # name = models.CharField(
    #     max_length=25,
    # )
    
    email = models.EmailField(
        unique=True,
    )
    
    # birth = models.CharField(
    #     max_length=6,
    #     null=True,
    #     blank=True
    # )
    
    # sex = models.BooleanField(
    #     null=True,
    #     blank=True
    # )
    
    # phoneNumber = models.CharField(
    #     max_length=11,
    #     null=True,
    #     blank=True
    # )
    
    is_staff = models.BooleanField(
        # django에서 필요한 필드
        default=False
    )

    is_active = models.BooleanField(
        # django에서 필요한 필드
        default=True
    )
    # code = models.UUIDField(
    #     # uuid 필드
    #     default=uuid.uuid4, 
    #     editable=True,
    #     null=True
    # )
    # identifyCode = models.CharField(
    #     max_length=6,
    #     null=True,
    #     blank=True
    # )
    # provider = models.CharField(
    #     max_length=15,
    #     null=True,
    #     blank=True
    # )
    
    objects = UserManager()
    USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['name','email']

class FolderCategory(models.Model):
    user = models.ForeignKey(
        "main.User",
        on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=20
    )

class UrlList(models.Model):
    folder_category = models.ForeignKey(
        "main.FolderCategory",
        on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=100
    )
    link = models.URLField()
    description = models.TextField(
        blank=True, null=True
    )
    image = models.TextField(
        blank=True, null=True
    )