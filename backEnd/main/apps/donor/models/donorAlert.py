from django.db import models

from .donorDetails import DonorDetails


class DonorAlert(models.Model):
    """
    Notifications for donors — eligibility reminders,
    urgent blood requests, camp announcements, etc.
    """

    TYPE_CHOICES = [
        ("eligibility", "Eligibility"),
        ("urgent", "Urgent Request"),
        ("info", "Information"),
        ("camp", "Camp Notification"),
    ]

    donor = models.ForeignKey(
        DonorDetails,
        on_delete=models.CASCADE,
        related_name="alerts",
    )
    message = models.TextField()
    alert_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    is_read = models.BooleanField(default=False)
    related_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.alert_type}] {self.message[:50]}"
