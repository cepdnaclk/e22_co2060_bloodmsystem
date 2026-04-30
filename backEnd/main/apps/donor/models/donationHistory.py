import uuid

from django.db import models

from .donorDetails import DonorDetails


class DonationHistory(models.Model):
    """
    Tracks every individual donation made by a donor.
    Used to build the History tab and compute lifetime stats.
    """

    STATUS_CHOICES = [
        ("completed", "Completed"),
        ("pending", "Pending"),
        ("cancelled", "Cancelled"),
    ]

    donor = models.ForeignKey(
        DonorDetails,
        on_delete=models.CASCADE,
        related_name="donation_history",
    )
    donation_date = models.DateField()
    hospital_name = models.CharField(
        max_length=100,
        help_text="Denormalised hospital name at the time of donation.",
    )
    hospital = models.ForeignKey(
        "UserAuth.Hospital",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations",
    )
    blood_group = models.CharField(
        max_length=3,
        help_text="Snapshot of blood group at time of donation.",
    )
    units = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="completed",
    )
    notes = models.TextField(blank=True)
    certificate_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique ID for printable donation certificate.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-donation_date", "-created_at"]
        verbose_name_plural = "Donation histories"

    def __str__(self):
        return f"{self.donor} — {self.donation_date} ({self.status})"
