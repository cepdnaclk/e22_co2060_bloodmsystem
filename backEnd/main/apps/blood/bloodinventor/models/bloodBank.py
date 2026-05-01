from apps.UserAuth.models.location import Country, District
from django.db import models

__all__ = ["BloodBank"]


class BloodBank(models.Model):
    bloodBankName = models.CharField(max_length=20)
    postTalCode = models.CharField(max_length=20)
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="districts"
    )
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name="country"
    )
    registrationId = models.IntegerField()
