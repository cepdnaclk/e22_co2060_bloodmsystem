from django.db import models

__all__=['Docter']

from phonenumber_field.formfields import PhoneNumberField
from rest_framework.fields import ImageField


class Docter(models.Model):
    fullname=models.CharField(max_length=20)
    email=models.EmailField(max_length=20)
    department=models.CharField(max_length=20)
    hospitalName=models.CharField(max_length=20)
    docterListen=models.CharField(max_length=10)
    phoneNumber=models.PhoneNumberField()
    profilePhoto=models.ImageField(blank=False,default='fallback.png')

    def __str__(self):
        return self.fullname

