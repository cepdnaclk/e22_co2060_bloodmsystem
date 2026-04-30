from django.db import models

from .bloodCamp import BloodCamp
from .donorDetails import DonorDetails


class CampRegistration(models.Model):
    """
    Model representing a donor's request to register/donate at a specific Blood Camp.
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    ]

    donor = models.ForeignKey(
        DonorDetails, on_delete=models.CASCADE, related_name="camp_registrations"
    )
    camp = models.ForeignKey(
        BloodCamp, on_delete=models.CASCADE, related_name="registrations"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    appointment_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Camp Registration"
        verbose_name_plural = "Camp Registrations"
        unique_together = ("donor", "camp")  # Prevent duplicate registrations

    def __str__(self):
        return f"{self.donor.user.username} - {self.camp.title} ({self.status})"
