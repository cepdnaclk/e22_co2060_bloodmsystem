
from django.db import models
from .bloodBank import BloodBank



class BloodInventory(models.Model):

    BLOOD_TYPES = [
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("O+", "O+"),
        ("O-", "O-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
    ]

    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPES)
    quantity = models.PositiveIntegerField()
    blood_bank = models.ForeignKey(BloodBank, on_delete=models.CASCADE)
    collected_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=20, default="available")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.blood_type} - {self.quantity} units"
