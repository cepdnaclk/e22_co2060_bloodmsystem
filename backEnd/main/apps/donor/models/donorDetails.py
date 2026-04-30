import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

# Minimum days between donations (Sri Lanka NBTS standard)
DONATION_GAP_DAYS = 90


class DonorDetails(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_available = models.BooleanField(default=True)
    qr_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    last_donation_date = models.DateField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='donor_profiles/', null=True, blank=True)

    total_donations = models.PositiveIntegerField(default=0)
    total_events = models.PositiveIntegerField(default=0)
    achievements = models.TextField(blank=True)

    # ─── Computed Properties ───────────────────────────────────
    @property
    def next_eligible_date(self):
        """Return the date when this donor can next donate."""
        if not self.last_donation_date:
            return None  # Never donated → eligible now
        return self.last_donation_date + timedelta(days=DONATION_GAP_DAYS)

    @property
    def is_eligible(self):
        """True if enough time has passed since the last donation."""
        if not self.last_donation_date:
            return True  # Never donated → eligible
        return timezone.now().date() >= self.next_eligible_date

    def __str__(self):
        return f"donor: {self.user.username}"
