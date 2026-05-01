from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

from .hospital import Hospital
from .location import Country, District

__all__ = ["User", "Profile"]

nic_validator = RegexValidator(
    regex=r"^(\d{12}|\d{9}[vVxX])$",
    message="Enter a valid 12-digit NIC or 9-digit with a letter (V/X).",
)


class User(AbstractUser):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

    ROLE_CHOICES = [
        (PATIENT, "Patient"),
        (DOCTOR, "Doctor"),
        (ADMIN, "Admin"),
    ]

    username = models.CharField(max_length=10, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=PATIENT)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username


class Profile(models.Model):
    BLOOD_GROUP_CHOICES = (
        ("A+", "A Positive"),
        ("A-", "A Negative"),
        ("B+", "B Positive"),
        ("B-", "B Negative"),
        ("AB+", "AB Positive"),
        ("AB-", "AB Negative"),
        ("O+", "O Positive"),
        ("O-", "O Negative"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    fullName = models.CharField(max_length=20)
    nic_number = models.CharField(
        max_length=12,
        unique=True,
        validators=[nic_validator],
        help_text="Format: 200213500619",
    )
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES,
        default="O+",
    )
    phoneNumber = PhoneNumberField(blank=True, null=True, unique=True)
    country = models.ForeignKey(
        Country,
        on_delete=models.SET_NULL,
        null=True,
        related_name="users",
    )
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True)
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.SET_NULL,
        null=True,
        related_name="users",
    )

    def __str__(self):
        return self.fullName
